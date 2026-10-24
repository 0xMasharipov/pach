import {createPublicClient,http,erc20Abi,formatEther,formatUnits,isAddress,zeroAddress} from 'viem';
import {run} from './process.mjs';

export async function preflight(){
  const rpc=process.env.MONAD_RPC_URL||'https://testnet-rpc.monad.xyz';
  const verifier=process.env.FYX_VERIFIER_ADDRESS;
  const treasury=process.env.FYX_TREASURY_ADDRESS;
  if(!verifier||!treasury||!isAddress(verifier)||!isAddress(treasury)||verifier===zeroAddress||treasury===zeroAddress)throw new Error('Set nonzero FYX_VERIFIER_ADDRESS and FYX_TREASURY_ADDRESS.');
  const keystore=process.env.FYX_DEPLOYER_KEYSTORE;
  const account=process.env.FYX_DEPLOYER_ACCOUNT;
  if(!keystore&&!account)throw new Error('Set FYX_DEPLOYER_KEYSTORE or FYX_DEPLOYER_ACCOUNT.');
  const password=process.env.FYX_KEYSTORE_PASSWORD_FILE;
  const walletArgs=[...(keystore?['--keystore',keystore]:['--account',account]),...(password?['--password-file',password]:[])];
  const deployer=await run('cast',['wallet','address',...walletArgs],{stdio:['inherit','pipe','inherit']});
  if(!isAddress(deployer))throw new Error('Could not derive an address from the encrypted deployment account.');
  const client=createPublicClient({transport:http(rpc,{timeout:15000,retryCount:1})});
  if(await client.getChainId()!==10143)throw new Error('RPC is not Monad Testnet 10143; refusing deployment.');
  const token='0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73';
  const code=await client.getCode({address:token});
  if(!code||code==='0x')throw new Error('No token contract exists at the configured test USDC address.');
  const [decimals,balance,tokenBalance]=await Promise.all([
    client.readContract({address:token,abi:erc20Abi,functionName:'decimals'}),
    client.getBalance({address:deployer}),
    client.readContract({address:token,abi:erc20Abi,functionName:'balanceOf',args:[deployer]}),
  ]);
  if(decimals!==6)throw new Error('Configured test USDC must have six decimals.');
  const report={chainId:10143,deployer,verifier,treasury,testUsdcAddress:token,testMon:formatEther(balance),testUsdc:formatUnits(tokenBalance,decimals),campaignDeposit:'20 test USDC',gasFunded:balance>0n};
  return {report,walletArgs,balance};
}

if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1]){
  try{console.log(JSON.stringify((await preflight()).report,null,2));}
  catch{console.error('Testnet preflight failed. Check RPC access, chain ID, six-decimal token, keystore and public addresses.');process.exitCode=1;}
}
