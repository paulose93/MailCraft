import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface CreateOrganizationDialogProps {
  className?: string;
}

export function CreateOrganizationDialog({ className }: CreateOrganizationDialogProps) {
  const { fetchUser, switchOrganization } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      setIsCreating(true);
      const { data } = await api.post('/organizations', { name });
      await fetchUser();
      switchOrganization(data.organization.id);
      setOpen(false);
      setName('');
    } catch (error: any) {
      console.error('Failed to create organization', error);
      alert('Error creating organization: ' + (error.message || JSON.stringify(error)));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" className={className} onClick={() => setOpen(true)}>
        Create Organization
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !name.trim()}>
              {isCreating ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
