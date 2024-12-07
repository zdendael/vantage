import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionCallback = (payload: any) => void;

export const subscribeToProjectUpdates = (
  projectId: string,
  onUpdate: SubscriptionCallback
): RealtimeChannel => {
  return supabase
    .channel(`project-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'project_completed_steps',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => onUpdate(payload)
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`
      },
      (payload) => onUpdate(payload)
    )
    .subscribe();
};

export const unsubscribeFromProjectUpdates = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel);
};