/// Top Panel Widget - Flutter Web implementation
/// Mirrors the LightningJS TopPanel component.
///
/// Displays: Mic icon, RDK Logo, Page title, Settings icon, Current time.
/// Original dimensions: 1920w x 270h, black background.

import 'dart:async';
import 'package:flutter/material.dart';

class TopPanel extends StatefulWidget {
  final double scale;
  final String pageTitle;
  final VoidCallback? onSettingsTap;

  const TopPanel({
    super.key,
    required this.scale,
    this.pageTitle = 'Home',
    this.onSettingsTap,
  });

  @override
  State<TopPanel> createState() => _TopPanelState();
}

class _TopPanelState extends State<TopPanel> {
  late Timer _timer;
  String _timeString = '';

  @override
  void initState() {
    super.initState();
    _updateTime();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _updateTime());
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _updateTime() {
    final now = DateTime.now();
    setState(() {
      _timeString =
          '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    });
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.scale;

    return Container(
      color: Colors.black,
      padding: EdgeInsets.symmetric(horizontal: 105 * s),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 87 * s),
          // Top row: Mic + Logo + Settings + Time
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Microphone icon
              Icon(
                Icons.mic,
                color: Colors.white,
                size: 40 * s,
              ),
              SizedBox(width: 40 * s),
              // Logo
              Image.asset(
                'assets/images/splash/RDKLogo.png',
                width: 180 * s,
                height: 35 * s,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Text(
                    'RDK',
                    style: TextStyle(
                      fontSize: 28 * s,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFFF58233),
                      fontFamily: 'Play',
                    ),
                  );
                },
              ),
              const Spacer(),
              // Settings icon
              GestureDetector(
                onTap: widget.onSettingsTap,
                child: MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: Icon(
                    Icons.settings,
                    color: Colors.white,
                    size: 32 * s,
                  ),
                ),
              ),
              SizedBox(width: 30 * s),
              // Time
              Text(
                _timeString,
                style: TextStyle(
                  fontSize: 30 * s,
                  fontFamily: 'Play',
                  color: Colors.white,
                ),
              ),
            ],
          ),
          SizedBox(height: 50 * s),
          // Page title
          Text(
            widget.pageTitle.toLowerCase(),
            style: TextStyle(
              fontSize: 36 * s,
              fontWeight: FontWeight.bold,
              fontFamily: 'Play',
              color: const Color(0xFFF58233),
            ),
          ),
        ],
      ),
    );
  }
}
