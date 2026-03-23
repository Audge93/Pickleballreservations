import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function SplashScreen({ onDone }) {
  const ballX = useRef(new Animated.Value(-20)).current;
  const ballY = useRef(new Animated.Value(0)).current;
  const paddle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(ballX, { toValue: 70, duration: 700, useNativeDriver: true }),
        Animated.timing(ballY, { toValue: -10, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(paddle, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(onDone, 450);
    });
  }, [ballX, ballY, paddle, onDone]);

  const rotate = paddle.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-18deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Animated.View style={[styles.ball, { transform: [{ translateX: ballX }, { translateY: ballY }] }]} />
        <Animated.View style={[styles.paddle, { transform: [{ rotate }] }]} />
        <Text style={styles.title}>PicklePlay</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy, justifyContent: 'center', alignItems: 'center' },
  center: { alignItems: 'center' },
  ball: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.yellow,
    top: -20,
    left: -20,
  },
  paddle: {
    width: 58,
    height: 90,
    borderRadius: 30,
    backgroundColor: colors.blue,
    marginBottom: 28,
  },
  title: { color: '#fff', fontSize: 32, fontWeight: '800' },
});
