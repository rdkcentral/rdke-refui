/// Settings Screen - Flutter Web implementation
/// Mirrors the LightningJS SettingsScreen component.
///
/// Displays a simple settings menu for demonstration purposes.

import 'package:flutter/material.dart';
import '../widgets/top_panel.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: LayoutBuilder(
        builder: (context, constraints) {
          final double scaleX = constraints.maxWidth / 1920;
          final double scaleY = constraints.maxHeight / 1080;
          final double scale = scaleX < scaleY ? scaleX : scaleY;

          return Stack(
            children: [
              // Top Panel
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: 270 * scaleY,
                child: TopPanel(
                  scale: scale,
                  pageTitle: 'Settings',
                  onSettingsTap: () => Navigator.pop(context),
                ),
              ),

              // Settings Content
              Positioned(
                top: 270 * scaleY,
                left: 200 * scaleX,
                right: 0,
                bottom: 0,
                child: _buildSettingsContent(context, scale),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSettingsContent(BuildContext context, double scale) {
    final settings = [
      {'title': 'Network', 'icon': Icons.wifi},
      {'title': 'Bluetooth', 'icon': Icons.bluetooth},
      {'title': 'Video & Audio', 'icon': Icons.tv},
      {'title': 'Other Settings', 'icon': Icons.settings},
    ];

    return Padding(
      padding: EdgeInsets.all(40 * scale),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...settings.map((setting) => _buildSettingItem(
            context,
            setting['title'] as String,
            setting['icon'] as IconData,
            scale,
          )),
          const Spacer(),
          // Back button
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.arrow_back),
            label: const Text('Back to Home'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF58233),
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                horizontal: 30 * scale,
                vertical: 15 * scale,
              ),
              textStyle: TextStyle(
                fontSize: 18 * scale,
                fontFamily: 'Play',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingItem(
    BuildContext context,
    String title,
    IconData icon,
    double scale,
  ) {
    return Container(
      margin: EdgeInsets.only(bottom: 10 * scale),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('$title - Mock setting (not implemented)'),
                duration: const Duration(seconds: 1),
                backgroundColor: const Color(0xFF333333),
              ),
            );
          },
          borderRadius: BorderRadius.circular(8 * scale),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: 20 * scale,
              vertical: 18 * scale,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              borderRadius: BorderRadius.circular(8 * scale),
              border: Border.all(
                color: const Color(0xFF333333),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Icon(icon, color: const Color(0xFFF58233), size: 28 * scale),
                SizedBox(width: 20 * scale),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 22 * scale,
                    fontFamily: 'Play',
                    color: Colors.white,
                  ),
                ),
                const Spacer(),
                Icon(
                  Icons.chevron_right,
                  color: Colors.grey,
                  size: 28 * scale,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
