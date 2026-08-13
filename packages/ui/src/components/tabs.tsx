import { Tabs as TabsPrimitive } from 'radix-ui';
import { type ReactNode } from 'react';

export type TabItem = Readonly<{
  content: ReactNode;
  label: string;
  value: string;
}>;

export type TabsProps = Readonly<{
  defaultValue: string;
  items: readonly TabItem[];
}>;

export function Tabs({ defaultValue, items }: TabsProps) {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue}>
      <TabsPrimitive.List className="ui-tabs-list">
        {items.map((item) => (
          <TabsPrimitive.Trigger className="ui-tabs-trigger" key={item.value} value={item.value}>
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content className="ui-tabs-content" key={item.value} value={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
