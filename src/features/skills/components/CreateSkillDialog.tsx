import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog } from '@/components/feedback/Dialog';
import { Field } from '@/components/forms/Field';
import { Input, Textarea } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import { skillsService } from '@/services/api';
import { toast } from '@/store/toastStore';

const schema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters'),
  domain: z.string().min(2, 'Domain is required'),
  description: z.string().max(280, 'Keep it under 280 characters').optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateSkillDialog({
  open,
  onClose,
  tenantId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  tenantId: string | null;
  onCreated: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (!tenantId) return;
    await skillsService.createPrivateSkill(tenantId, values);
    toast({ title: 'Private skill created', variant: 'success', description: `"${values.name}" was added to your tenant's taxonomy.` });
    reset();
    onCreated();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add a private skill"
      description="Private skills are visible only within your tenant and appear alongside the shared platform taxonomy."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            Create skill
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Field label="Skill name" required htmlFor="skill-name" error={errors.name?.message}>
          <Input id="skill-name" placeholder="e.g. Rust" invalid={Boolean(errors.name)} {...register('name')} />
        </Field>
        <Field label="Domain" required htmlFor="skill-domain" error={errors.domain?.message}>
          <Input id="skill-domain" placeholder="e.g. Programming Languages" invalid={Boolean(errors.domain)} {...register('domain')} />
        </Field>
        <Field label="Description" htmlFor="skill-description" error={errors.description?.message} hint="Optional — helps authors apply this skill consistently.">
          <Textarea id="skill-description" rows={3} {...register('description')} />
        </Field>
      </form>
    </Dialog>
  );
}
