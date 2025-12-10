import type { Meta, StoryObj } from '@storybook/react-vite';
import CountrySelector from './country-selector';
import '../../App.css';

const meta = {
    title: 'Components/CountrySelector',
    component: CountrySelector,
    parameters: {
        layout: 'padded',
    },
    globals: {
        // 👇 Set background value for all component stories
        backgrounds: { value: 'gray', grid: false },
    },
} satisfies Meta<typeof CountrySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dialcode: Story = {
    args: {
        type: 'dialCode',
    },
};

export const Nationality: Story = {
    args: {
        type: 'nationality',
    },
};

// 與手機號碼輸入框組合使用（模擬真實表單場景）
export const WithPhoneNumber: Story = {
    args: {
        type: 'dialCode',
        label: '電話國碼',
        name: 'countryCode',
        required: true,
    },
    render: (args) => (
        <div className="input-wrapper">
            <CountrySelector {...args} defaultValue="501" />
            <input
                type="tel"
                id="phone-number"
                name="phoneNumber"
                placeholder="請輸入號碼"
                className="phone-number"
                required
            />
        </div>
    ),
};
