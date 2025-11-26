import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import Head from 'next/head';
import SetupScreen from '../components/SetupScreen';
import GameScreen from '../components/GameScreen';
import riddlesData from '../data/riddles';

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [riddles, setRiddles] = useState([]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAddPlayer = (name) => {
    const newPlayer = {
      id: Date.now(),
      name,
      score: 0,
    };
    setPlayers([...players, newPlayer]);
  };

  const handleRemovePlayer = (id) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  const handleStartGame = () => {
    setRiddles(shuffleArray(riddlesData));
    setGameStarted(true);
    setCurrentRiddleIndex(0);
    setShowAnswer(false);
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextRiddle = () => {
    if (currentRiddleIndex < riddles.length - 1) {
      setCurrentRiddleIndex(currentRiddleIndex + 1);
      setShowAnswer(false);
    } else {
      // Game over - stay on scoreboard
      setShowAnswer(false);
    }
  };

  const handleAwardPoint = (playerId) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId ? { ...player, score: player.score + 1 } : player
      )
    );
  };

  const currentRiddle = riddles[currentRiddleIndex];
  const isLastRiddle = currentRiddleIndex === riddles.length - 1;

  return (
    <>
      <Head>
        <title>Dirty Minds - Party Game</title>
        <meta name="description" content="A fun party game with dirty minds but innocent answers" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container maxWidth="sm">
        <Box sx={{ py: 4, minHeight: '100vh' }}>
          {!gameStarted ? (
            <SetupScreen
              players={players}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onStartGame={handleStartGame}
            />
          ) : (
            <GameScreen
              currentRiddle={currentRiddle}
              riddleNumber={currentRiddleIndex + 1}
              totalRiddles={riddles.length}
              showAnswer={showAnswer}
              players={players}
              onRevealAnswer={handleRevealAnswer}
              onNextRiddle={handleNextRiddle}
              onAwardPoint={handleAwardPoint}
              isLastRiddle={isLastRiddle}
            />
          )}
        </Box>
      </Container>
    </>
  );
}
