export function hasFullVerification(result,address,chainId=10143){
  return Array.isArray(result)&&result.some(entry=>
    typeof entry?.address==='string'&&entry.address.toLowerCase()===address.toLowerCase()&&
    entry.status==='perfect'&&Array.isArray(entry.chainIds)&&entry.chainIds.map(String).includes(String(chainId))
  );
}
