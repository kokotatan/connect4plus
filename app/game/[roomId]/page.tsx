'use client';

import { useParams } from 'next/navigation';

export default function GamePage() {
  const params = useParams();
  const roomId = params.roomId as string;

  return (
    <></>
  );
} 