'use client';
import {useSearchParams} from 'next/navigation';
import {PlayPage} from '../../../components/pages';
export default function PlayRoute(){const query=useSearchParams();const challengeId=query.get('challenge')||undefined;return <PlayPage key={challengeId||'practice'} challengeId={challengeId}/>;}
