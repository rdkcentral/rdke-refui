/// Mock API Service - Flutter Web implementation
/// Replaces LightningJS Thunder/RDKShell/AppApi calls with static mock data.
///
/// This service provides the same data structures that the LightningJS app
/// retrieves from various APIs (HomeApi, AppApi, etc.) but returns mock/static
/// data suitable for UI testing on the target device.

class AppInfo {
  final String displayName;
  final String applicationType;
  final String uri;
  final String? imageAsset;
  final String appIdentifier;

  const AppInfo({
    required this.displayName,
    required this.applicationType,
    required this.uri,
    this.imageAsset,
    required this.appIdentifier,
  });
}

class SidePanelInfo {
  final String title;
  final String iconPath;

  const SidePanelInfo({required this.title, required this.iconPath});
}

/// Mock API providing static data matching the LightningJS app's data sources.
class MockApi {
  /// Returns app list matching static/data/AppListInfo.js
  static List<AppInfo> getAppList() {
    return const [
      AppInfo(
        displayName: 'Netflix',
        applicationType: 'Netflix',
        uri: '',
        imageAsset: 'assets/images/apps/App_Netflix_454x255.png',
        appIdentifier: 'n:1',
      ),
      AppInfo(
        displayName: 'Amazon Prime Video',
        applicationType: 'Amazon',
        uri: '',
        imageAsset: 'assets/images/apps/App_Amazon_Prime_454x255.png',
        appIdentifier: 'n:2',
      ),
      AppInfo(
        displayName: 'YouTube',
        applicationType: 'YouTube',
        uri: 'https://www.youtube.com/tv',
        imageAsset: 'assets/images/apps/App_YouTube_454x255.png',
        appIdentifier: 'n:3',
      ),
      AppInfo(
        displayName: 'YouTube TV',
        applicationType: 'YouTubeTV',
        uri: 'https://www.youtube.com/tv/upg',
        imageAsset: 'assets/images/apps/App_YouTubeTV_454x255.png',
        appIdentifier: 'n:4',
      ),
      AppInfo(
        displayName: 'Peacock',
        applicationType: 'Peacock',
        uri: '',
        imageAsset: 'assets/images/apps/App_Peacock_454x255.png',
        appIdentifier: 'n:6',
      ),
      AppInfo(
        displayName: 'Xumo',
        applicationType: 'HtmlApp',
        uri: 'https://x1box-app.xumo.com/index.html',
        imageAsset: 'assets/images/apps/App_Xumo_454x255.png',
        appIdentifier: 'n:7',
      ),
      AppInfo(
        displayName: 'YouTube Kids',
        applicationType: 'YouTubeKids',
        uri: '',
        imageAsset: 'assets/images/apps/App_YouTubeKids_454x255.png',
        appIdentifier: 'n:8',
      ),
    ];
  }

  /// Returns side panel items matching static/data/SidePanelInfo.js
  static List<SidePanelInfo> getSidePanelInfo() {
    return const [
      SidePanelInfo(title: 'Apps', iconPath: 'assets/images/sidePanel/menu.png'),
      SidePanelInfo(title: 'AppInfo', iconPath: 'assets/images/sidePanel/settings.png'),
    ];
  }

  /// Mock: Device info (replaces Thunder SystemService calls)
  static Map<String, String> getDeviceInfo() {
    return {
      'model': 'RDK Reference Device',
      'firmware': '1.0.0-flutter-web',
      'platform': 'WPE/Flutter',
      'resolution': '1920x1080',
    };
  }

  /// Mock: Network status (replaces NetworkManager API)
  static Map<String, dynamic> getNetworkStatus() {
    return {
      'connected': true,
      'type': 'WiFi',
      'ssid': 'MockNetwork',
      'signalStrength': -45,
    };
  }
}
