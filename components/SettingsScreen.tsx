import { ExtensionTokenCard } from "./ExtensionTokenCard";
import { SignOutButton } from "./SignOutButton";

export function SettingsScreen() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
      <ExtensionTokenCard />
      <SignOutButton />
    </div>
  );
}
