"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primarybutton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/src/lib/supabase/client";

interface GDPRConsentProps {
  userId: string;
  onConsent: () => void;
}

export function GDPRConsent({ userId, onConsent }: GDPRConsentProps) {
  const [open, setOpen] = useState(true);
  const supabase = createClient();

  const handleConsent = async (consent: boolean) => {
    if (consent) {
      await supabase
        .from("profiles")
        .update({
          gdpr_consent: true,
          gdpr_consent_date: new Date().toISOString(),
        })
        .eq("id", userId);

      onConsent();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Data Privacy Consent</DialogTitle>
          <DialogDescription>
            To provide you with personalised community recommendations, we need
            your consent to:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4 text-sm">
          <p>• Store your location to show nearby community information</p>
          <p>• Save your conversation history to improve responses</p>
          <p>• Use your preferences to personalise recommendations</p>
        </div>
        <p className="text-xs text-muted-foreground">
          You can withdraw consent and delete your data at any time from
          Settings. Read our{" "}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
          .
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleConsent(false)}>
            Decline
          </Button>
          <Button onClick={() => handleConsent(true)}>I Consent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
