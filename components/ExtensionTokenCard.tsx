import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ExtensionTokenCard() {
  return (
    <Card className="shadow-none border-dashed mb-4">
      <CardContent className="pt-6">
        <span className="text-[10px] font-mono text-muted-foreground mb-4 block">extension-token-card</span>
        <div className="h-2 bg-secondary rounded-full w-[80%] mb-4" />
        <Button variant="outline" size="sm" className="text-xs h-8">
          Regenerate token
        </Button>
      </CardContent>
    </Card>
  );
}
