import React from 'react';
import { ColorScheme } from '../../constants/colorSchemes';
import TextEditModal from '../modals/TextEditModal';

interface Props {
  visible: boolean;
  scheme: ColorScheme;
  title?: string;
  namePlaceholder?: string;
  descPlaceholder?: string;
  onAdd: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function AddItemRow({
  visible,
  scheme,
  title,
  namePlaceholder = 'Name',
  descPlaceholder = 'Description (optional)',
  onAdd,
  onCancel,
}: Props) {

  return (
    <TextEditModal
      visible={visible}
      scheme={scheme}
      title={title ?? 'Add Item'}
      namePlaceholder={namePlaceholder}
      descPlaceholder={descPlaceholder}
      onConfirm={onAdd}
      onCancel={onCancel}
    />
  );
}
