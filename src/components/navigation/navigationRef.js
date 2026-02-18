import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingNavigation = null;

function _getAvailableRouteNames() {
    try {
        if (!navigationRef.isReady()) return [];
        const state = navigationRef.getRootState?.();
        const routeNames = state?.routeNames;
        return Array.isArray(routeNames) ? routeNames : [];
    } catch {
        return [];
    }
}

function _canNavigateTo(name) {
    if (typeof name !== 'string' || name.trim().length === 0) return false;
    const available = _getAvailableRouteNames();
    // Note: this checks the currently mounted navigator's routeNames.
    // If RootNavigator conditionally renders stacks, routeNames will change.
    return available.includes(name);
}

export function navigate(name, params) {
    if (navigationRef.isReady() && _canNavigateTo(name)) {
        navigationRef.navigate(name, params);
        return;
    }
    // Either nav isn't ready yet, or the current stack doesn't have this route
    // (e.g., user is on Login stack). Queue it and flush later.
    pendingNavigation = { name, params };
}

export function flushPendingNavigation() {
    if (!pendingNavigation) return;
    if (!navigationRef.isReady()) return;

    if (!_canNavigateTo(pendingNavigation.name)) return;

    const { name, params } = pendingNavigation;
    pendingNavigation = null;
    navigationRef.navigate(name, params);
}

export function navigateToNotifications() {
    navigate('Notifications');
}
