import React from 'react';
import { Container, Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import DevicesIcon from '@mui/icons-material/Devices';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PersonIcon from '@mui/icons-material/Person';
import { playSound } from '../utils/sounds';
import { animationPresets, staggerContainer } from '../theme-enhanced';

export default function Home() {
  const router = useRouter();

  const handleNavigation = (path) => {
    playSound('click');
    router.push(path);
  };

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
          <motion.div {...animationPresets.fadeIn}>
            <Card>
              <CardContent>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
                >
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
                    Dirty Minds
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
                    Riddles with dirty minds but innocent answers
                  </Typography>
                </motion.div>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <Stack spacing={2}>
                    <motion.div variants={animationPresets.slideUp}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<DevicesIcon />}
                        onClick={() => handleNavigation('/host')}
                        sx={{ py: 2 }}
                      >
                        Host Game (Multiplayer)
                      </Button>
                    </motion.div>

                    <motion.div variants={animationPresets.slideUp}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        startIcon={<PhoneAndroidIcon />}
                        onClick={() => handleNavigation('/join')}
                        sx={{ py: 2 }}
                      >
                        Join Game
                      </Button>
                    </motion.div>

                    <motion.div variants={animationPresets.slideUp}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        size="large"
                        startIcon={<PersonIcon />}
                        onClick={() => handleNavigation('/single-player')}
                        sx={{ py: 2 }}
                      >
                        Single Device Mode
                      </Button>
                    </motion.div>
                  </Stack>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
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
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Container>
    </>
  );
}
