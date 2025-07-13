import React from 'react';
import GamePlayScreen from '../components/GamePlayScreen';

const player1 = {
  name: 'User 1',
  avatar: '/assets/Avater/Avater/normal_graycat.png',
  score: 0,
  isTurn: true,
  timer: 0,
  isActive: true,
  type: 'graycat',
};
const player2 = {
  name: 'User 2',
  avatar: '/assets/Avater/Avater/normal_tiger.png',
  score: 0,
  isTurn: false,
  timer: 0,
  isActive: true,
  type: 'tiger',
};

export default function GamePage() {
  return <GamePlayScreen player1={player1} player2={player2} />;
} 