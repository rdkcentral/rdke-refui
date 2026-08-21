/// Splash Screen - Flutter Web implementation
/// Mirrors the LightningJS SplashScreen component.
///
/// Displays the RDK logo centered on a splash background,
/// then navigates to the home screen after a short delay.

import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    _controller.forward();

    // Navigate to home after splash duration (similar to LightningJS splash timeout)
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/images/splash/Splash-Background.jpg'),
              fit: BoxFit.cover,
            ),
          ),
          child: Center(
            child: Image.asset(
              'assets/images/splash/RDKLogo.png',
              width: 400,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                // Fallback if image not available
                return const Text(
                  'RDK',
                  style: TextStyle(
                    fontSize: 72,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFF58233),
                    fontFamily: 'Play',
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
