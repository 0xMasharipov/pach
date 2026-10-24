import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {Skeleton} from '../../../components/system';
import PlayRoute from './client';
export function generateStaticParams(){return [{levelId:'checkout'}];}
export default async function Page({params}:{params:Promise<{levelId:string}>}){const {levelId}=await params;if(levelId!=='checkout')notFound();return <Suspense fallback={<div className="shell page-space"><Skeleton/></div>}><PlayRoute/></Suspense>;}
