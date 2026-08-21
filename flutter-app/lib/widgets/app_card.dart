/// App Card Widget - Flutter Web implementation
/// Mirrors the LightningJS ListItem / AppCard component.
///
/// Displays an app thumbnail with name, focus highlight on selection.
/// Original card size: 454x255 (aspect ratio ~1.78:1).

import 'package:flutter/material.dart';
import '../services/mock_api.dart';

class AppCard extends StatelessWidget {
  final AppInfo app;
  final bool isFocused;
  final double scale;
  final VoidCallback? onTap;
  final VoidCallback? onFocus;

  const AppCard({
    super.key,
    required this.app,
    required this.isFocused,
    required this.scale,
    this.onTap,
    this.onFocus,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => onFocus?.call(),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          transform: isFocused
              ? (Matrix4.identity()..scale(1.05))
              : Matrix4.identity(),
          transformAlignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8 * scale),
            border: isFocused
                ? Border.all(
                    color: const Color(0xFFF58233),
                    width: 3 * scale,
                  )
                : Border.all(
                    color: Colors.transparent,
                    width: 3 * scale,
                  ),
            boxShadow: isFocused
                ? [
                    BoxShadow(
                      color: const Color(0xFFF58233).withOpacity(0.3),
                      blurRadius: 12 * scale,
                      spreadRadius: 2 * scale,
                    ),
                  ]
                : [],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(6 * scale),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // App image
                _buildAppImage(),

                // App name overlay at bottom
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 10 * scale,
                      vertical: 8 * scale,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.8),
                        ],
                      ),
                    ),
                    child: Text(
                      app.displayName,
                      style: TextStyle(
                        fontSize: 14 * scale,
                        fontFamily: 'Play',
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAppImage() {
    if (app.imageAsset != null) {
      return Image.asset(
        app.imageAsset!,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return _buildPlaceholder();
        },
      );
    }
    return _buildPlaceholder();
  }

  Widget _buildPlaceholder() {
    return Container(
      color: const Color(0xFF1A1A1A),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.apps,
              color: const Color(0xFFF58233),
              size: 40 * scale,
            ),
            SizedBox(height: 8 * scale),
            Text(
              app.displayName,
              style: TextStyle(
                fontSize: 16 * scale,
                fontFamily: 'Play',
                color: Colors.white70,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
