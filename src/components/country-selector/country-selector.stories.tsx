import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import '../../App.css';
import CountrySelector from './index';

const meta = {
    title: 'Components/CountrySelector',
    parameters: {
        layout: 'padded',
    },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * Nationality 模式 - 用於選擇國籍
 */
export const Nationality: Story = {
    render: function NationalityStory() {
        const [value, setValue] = useState('TW');

        return (
            <CountrySelector.Root
                type="nationality"
                value={value}
                onChange={(country) => setValue(country?.shortName || '')}
                required
            >
                <CountrySelector.Trigger />
                <CountrySelector.Dropdown />
            </CountrySelector.Root>
        );
    },
};

/**
 * DialCode 模式 - 用於選擇國家電話區號
 */
export const DialCode: Story = {
    render: function DialCodeStory() {
        const [dialCode, setDialCode] = useState('886');

        return (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <CountrySelector.Root
                    type="dialCode"
                    value={dialCode}
                    onChange={(country) => setDialCode(country?.code || '')}
                >
                    <CountrySelector.Trigger />
                    <CountrySelector.Dropdown />
                </CountrySelector.Root>
            </div>
        );
    },
};
