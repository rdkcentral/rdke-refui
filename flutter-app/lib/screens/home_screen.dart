/// Home Screen - Flutter Web implementation
/// Mirrors the LightningJS MainView + Menu (TopPanel + SidePanel).
///
/// Layout (1920x1080 design):
/// - TopPanel: logo, page title, settings icon, time
/// - SidePanel: vertical navigation (Apps, AppInfo)
/// - MainView: app cards grid

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../widgets/top_panel.dart';
import '../widgets/side_panel.dart';
import '../widgets/app_card.dart';
import '../services/mock_api.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedSideIndex = 0;
  int _focusedAppIndex = 0;
  final FocusNode _mainFocusNode = FocusNode();
  late List<AppInfo> _apps;

  @override
  void initState() {
    super.initState();
    _apps = MockApi.getAppList();
  }

  @override
  void dispose() {
    _mainFocusNode.dispose();
    super.dispose();
  }

  void _onSideItemSelected(int index) {
    setState(() {
      _selectedSideIndex = index;
    });
  }

  void _onAppFocused(int index) {
    setState(() {
      _focusedAppIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: KeyboardListener(
        focusNode: _mainFocusNode,
        autofocus: true,
        onKeyEvent: _handleKeyEvent,
        child: LayoutBuilder(
          builder: (context, constraints) {
            // Scale factor for different screen sizes (designed for 1920x1080)
            final double scaleX = constraints.maxWidth / 1920;
            final double scaleY = constraints.maxHeight / 1080;
            final double scale = scaleX < scaleY ? scaleX : scaleY;

            return Stack(
              children: [
                // Background
                Container(color: Colors.black),

                // Top Panel
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 270 * scaleY,
                  child: TopPanel(
                    scale: scale,
                    onSettingsTap: () {
                      Navigator.pushNamed(context, '/settings');
                    },
                  ),
                ),

                // Side Panel
                Positioned(
                  top: 270 * scaleY,
                  left: 0,
                  width: 200 * scaleX,
                  bottom: 0,
                  child: SidePanel(
                    scale: scale,
                    selectedIndex: _selectedSideIndex,
                    onItemSelected: _onSideItemSelected,
                  ),
                ),

                // Main Content Area
                Positioned(
                  top: 270 * scaleY,
                  left: 200 * scaleX,
                  right: 0,
                  bottom: 0,
                  child: _buildMainContent(scale),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildMainContent(double scale) {
    if (_selectedSideIndex == 0) {
      return _buildAppsView(scale);
    } else {
      return _buildAppInfoView(scale);
    }
  }

  Widget _buildAppsView(double scale) {
    return Padding(
      padding: EdgeInsets.all(20 * scale),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section title
          Text(
            'Apps',
            style: TextStyle(
              fontSize: 25 * scale,
              fontFamily: 'Play',
              color: Colors.white,
              fontWeight: FontWeight.normal,
            ),
          ),
          SizedBox(height: 20 * scale),

          // App cards grid
          Expanded(
            child: GridView.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                childAspectRatio: 454 / 255,
                crossAxisSpacing: 20 * scale,
                mainAxisSpacing: 20 * scale,
              ),
              itemCount: _apps.length,
              itemBuilder: (context, index) {
                return AppCard(
                  app: _apps[index],
                  isFocused: _focusedAppIndex == index,
                  scale: scale,
                  onTap: () => _onAppTap(_apps[index]),
                  onFocus: () => _onAppFocused(index),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppInfoView(double scale) {
    return Padding(
      padding: EdgeInsets.all(40 * scale),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'App Info',
            style: TextStyle(
              fontSize: 25 * scale,
              fontFamily: 'Play',
              color: Colors.white,
            ),
          ),
          SizedBox(height: 30 * scale),
          Container(
            padding: EdgeInsets.all(20 * scale),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              borderRadius: BorderRadius.circular(8 * scale),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _infoRow('Application', 'RefUI Flutter Web', scale),
                _infoRow('Version', '1.0.0', scale),
                _infoRow('Platform', 'Flutter Web (RDK/WPE)', scale),
                _infoRow('Resolution', '1920 x 1080', scale),
                _infoRow('Framework', 'Flutter ${_getFlutterVersion()}', scale),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value, double scale) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8 * scale),
      child: Row(
        children: [
          SizedBox(
            width: 200 * scale,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 20 * scale,
                fontFamily: 'Play',
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 20 * scale,
                fontFamily: 'Play',
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getFlutterVersion() {
    return '3.x'; // Placeholder; actual version determined at build time
  }

  void _onAppTap(AppInfo app) {
    // Mock: Show a snackbar indicating app launch (no real Thunder/RDK API)
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Launching ${app.displayName}...'),
        duration: const Duration(seconds: 2),
        backgroundColor: const Color(0xFFF58233),
      ),
    );
  }

  void _handleKeyEvent(KeyEvent event) {
    if (event is! KeyDownEvent) return;

    setState(() {
      switch (event.logicalKey) {
        case LogicalKeyboardKey.arrowLeft:
          if (_focusedAppIndex % 4 > 0) _focusedAppIndex--;
          break;
        case LogicalKeyboardKey.arrowRight:
          if (_focusedAppIndex % 4 < 3 && _focusedAppIndex < _apps.length - 1) {
            _focusedAppIndex++;
          }
          break;
        case LogicalKeyboardKey.arrowUp:
          if (_focusedAppIndex >= 4) _focusedAppIndex -= 4;
          break;
        case LogicalKeyboardKey.arrowDown:
          if (_focusedAppIndex + 4 < _apps.length) _focusedAppIndex += 4;
          break;
        case LogicalKeyboardKey.enter:
        case LogicalKeyboardKey.select:
          _onAppTap(_apps[_focusedAppIndex]);
          break;
        default:
          break;
      }
    });
  }
}
