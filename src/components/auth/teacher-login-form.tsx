'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function TeacherLoginForm() {
  const [accessCode, setAccessCode] = useState('');
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: The logic to validate the access code and open the teacher
    // dashboard needs to be implemented.
    toast({
      title: 'Feature not implemented',
      description: 'The teacher access code validation is not yet available.',
    });
  };

  return (
    <Card className="w-full max-w-sm border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Teacher Access</CardTitle>
        <CardDescription>
          Enter the 6-digit access code provided to you.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="access-code">Access Code</Label>
            <Input
              id="access-code"
              type="text"
              placeholder="123456"
              required
              maxLength={6}
              value={accessCode}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                setAccessCode(numericValue);
              }}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button type="submit" className="w-full">
            Enter Dashboard
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
