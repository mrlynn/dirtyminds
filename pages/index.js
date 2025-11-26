import React from 'react';
import { Container, Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DevicesIcon from '@mui/icons-material/Devices';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PersonIcon from '@mui/icons-material/Person';

export default function Home() {
  const router = useRouter();

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
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
                Dirty Minds
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
                Riddles with dirty minds but innocent answers
              </Typography>

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<DevicesIcon />}
                  onClick={() => router.push('/host')}
                  sx={{ py: 2 }}
                >
                  Host Game (Multiplayer)
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<PhoneAndroidIcon />}
                  onClick={() => router.push('/join')}
                  sx={{ py: 2 }}
                >
                  Join Game
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<PersonIcon />}
                  onClick={() => router.push('/single-player')}
                  sx={{ py: 2 }}
                >
                  Single Device Mode
                </Button>
              </Stack>

              <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
                  How to play (Multiplayer):
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  1. Host creates a game and shows QR code<br />
                  2. Players scan QR code to join<br />
                  3. Host reads riddle aloud<br />
                  4. First player to buzz in gets to answer<br />
                  5. Host awards points and moves to next riddle
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
}
