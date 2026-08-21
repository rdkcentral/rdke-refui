/// Side Panel Widget - Flutter Web implementation
/// Mirrors the LightningJS SidePanel component.
///
/// Displays vertical navigation items: Apps, AppInfo
/// Original dimensions: 200w, y: 270, black background.

import 'package:flutter/material.dart';

class SidePanelItem {
  final String title;
  final IconData icon;

  const SidePanelItem({required this.title, required this.icon});
}

class SidePanel extends StatelessWidget {
  final double scale;
  final int selectedIndex;
  final ValueChanged<int> onItemSelected;

  const SidePanel({
    super.key,
    required this.scale,
    required this.selectedIndex,
    required this.onItemSelected,
  });

  static const List<SidePanelItem> _items = [
    SidePanelItem(title: 'Apps', icon: Icons.apps),
    SidePanelItem(title: 'AppInfo', icon: Icons.info_outline),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black,
      padding: EdgeInsets.only(top: 80 * scale),
      child: Column(
        children: List.generate(_items.length, (index) {
          final item = _items[index];
          final isSelected = selectedIndex == index;

          return GestureDetector(
            onTap: () => onItemSelected(index),
            child: MouseRegion(
              cursor: SystemMouseCursors.click,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: EdgeInsets.symmetric(
                  vertical: 10 * scale,
                  horizontal: 15 * scale,
                ),
                padding: EdgeInsets.all(12 * scale),
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFFF58233).withOpacity(0.2)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8 * scale),
                  border: isSelected
                      ? Border.all(
                          color: const Color(0xFFF58233),
                          width: 2,
                        )
                      : null,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      item.icon,
                      color: isSelected
                          ? const Color(0xFFF58233)
                          : Colors.white70,
                      size: 32 * scale,
                    ),
                    SizedBox(height: 6 * scale),
                    Text(
                      item.title,
                      style: TextStyle(
                        fontSize: 12 * scale,
                        fontFamily: 'Play',
                        color: isSelected
                            ? const Color(0xFFF58233)
                            : Colors.white70,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
