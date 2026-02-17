import React from "react";
import StudentDrawerNavigator from "./StudentDrawerNavigator";

const StudentMainScreen = () => {
  // If you change hooks inside StudentDrawerNavigator during development,
  // Fast Refresh can temporarily keep old hook state and throw "hook order" errors.
  // Bumping this key forces a remount and clears that stale state.
  return <StudentDrawerNavigator key="student-drawer-v2" />;
};

export default StudentMainScreen;
