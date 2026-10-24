import {ArenaPage} from '../../../components/pages';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ArenaPage id={id}/>;}
export function generateStaticParams(){return [{id:'preview'},{id:'preview-checkout'}];}
