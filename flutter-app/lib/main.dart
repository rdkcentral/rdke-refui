/// RDK Reference UI - Flutter Web Implementation
/// Main entry point for the application.
///
/// Copyright 2020 RDK Management
/// Licensed under the Apache License, Version 2.0

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';
import 'screens/settings_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Lock orientation to landscape for TV-like experience
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);
  // Hide system overlays for full-screen experience
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersive);
  runApp(const RefUIApp());
}

class RefUIApp extends StatelessWidget {
  const RefUIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RDK Reference UI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFFF58233), // Orange theme from CONFIG
        scaffoldBackgroundColor: Colors.black,
        fontFamily: 'Play',
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFF58233),
          secondary: Color(0xFFF58233),
          surface: Colors.black,
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/home': (context) => const HomeScreen(),
        '/settings': (context) => const SettingsScreen(),
      },
    );
  }
}
