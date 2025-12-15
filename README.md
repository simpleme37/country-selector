# CountrySelector 國家選擇器元件

一個 React + TypeScript 國家選擇器元件，支援電話國碼與國籍兩種模式。

## 功能

- 雙模式支援：電話國碼 (`dialCode`) 與國籍 (`nationality`) 模式
- 智慧搜尋：支援多欄位搜尋（國碼、中文名、英文名、縮寫），完全匹配優先、部分匹配次要
- 搜尋關鍵字標記：自動 highlight 匹配的關鍵字
- 字母分組：按 A-Z 字母分組顯示
- 鍵盤互動：支援 Enter、Escape 鍵操作
- 自動定位：開啟選單時自動捲動至已選項目
- 受控/非受控：支援兩種模式

---

## 安裝

```bash
pnpm install
```

---

## 使用說明

### 基礎用法

```tsx
import CountrySelector from './components/country-selector/country-selector';

function App() {
    return <CountrySelector type="dialCode" label="電話國碼" placeholder="請選擇國碼" />;
}
```

### 受控模式

```tsx
function App() {
    const [selectedCode, setSelectedCode] = useState('886');

    return (
        <CountrySelector
            type="dialCode"
            value={selectedCode}
            onChange={(country) => {
                setSelectedCode(country?.code || '');
                console.log('選擇了：', country?.zhName);
            }}
        />
    );
}
```

### 非受控模式

```tsx
function App() {
    return (
        <CountrySelector
            type="nationality"
            defaultValue="TW"
            onChange={(country) => console.log(country)}
        />
    );
}
```

---

---

## Props API

### Root Props

| Prop         | 類型                               | 必填 | 預設值 | 說明                      |
| ------------ | ---------------------------------- | ---- | ------ | ------------------------- |
| type         | 'dialCode' \| 'nationality'        | 是   |        | 選擇器模式                |
| value        | string                             | 否   |        | 受控模式，當前選中的值    |
| defaultValue | string                             | 否   |        | 非受控模式，預設選中的值  |
| onChange     | (country: Country \| null) => void | 否   |        | 選擇變更時的回調函數      |
| label        | string                             | 否   |        | 表單標籤                  |
| name         | string                             | 否   |        | input name                |
| required     | boolean                            | 否   | false  | 是否必填                  |
| disabled     | boolean                            | 否   | false  | 是否禁用元件              |
| loading      | boolean                            | 否   |        | 外部 loading 狀態         |
| dataSource   | CountryList                        | 否   |        | 外部資料來源              |
| className    | string                             | 否   |        | 自訂 CSS class            |
| children     | ReactNode                          | 是   |        | 必須包含 Trigger/Dropdown |

### Trigger Props

| Prop        | 類型      | 必填 | 說明                             |
| ----------- | --------- | ---- | -------------------------------- |
| children    | ReactNode | 否   | 可選：自訂的 input 或 button     |
| className   | string    | 否   | 自訂 CSS class                   |
| placeholder | string    | 否   | 按鈕 placeholder（未選中時顯示） |

### Dropdown Props

| Prop              | 類型   | 必填 | 說明                   |
| ----------------- | ------ | ---- | ---------------------- |
| className         | string | 否   | 自訂 CSS class         |
| hint              | string | 否   | 下拉選單上方的提示文字 |
| searchPlaceholder | string | 否   | 搜尋框 placeholder     |

### 1. 搜尋與過濾

支援多欄位搜尋，並依匹配程度排序：

- **完全匹配**優先（任一欄位完全相同）
- **部分匹配**次之（任一欄位包含搜尋詞）
- 支援欄位：`code`、`zhName`、`enName`、`shortName`

```tsx
// 搜尋「日」會匹配：
// - 日本 (完全匹配 zhName)
// - 尼日 (部分匹配 zhName)
```

### 2. 鍵盤與互動

| 操作              | 行為                                               |
| ----------------- | -------------------------------------------------- |
| `Enter`           | 選擇搜尋結果第一筆並關閉選單                       |
| `Escape`          | 清空搜尋並關閉選單（保持原選項）                   |
| `Blur` / 點擊外部 | 有搜尋內容時選擇第一筆，否則關閉選單（保持原選項） |

### 3. 字母分組

無搜尋時，國家列表按 `shortName` 首字母 A-Z 分組顯示，每組有字母標題。

### 4. 自動定位

開啟選單時，自動捲動至已選中的項目（置於可視範圍頂部）。

---

## 專案結構

```
src/components/country-selector/
├── country-selector.tsx        # 主元件
├── country-selector.scss       # 樣式（BEM 命名）
├── types/
│   └── country-selector.ts     # TypeScript 型別定義
└── utils/
    └── countryUtils.tsx        # 工具函數（排序、分組、highlight）
```

---

## 開發指令

```bash
# 啟動開發伺服器
pnpm dev

# 啟動 storybook
pnpm storybook

# 啟動開發伺服器與 storybook
pnpm dev:all

# Lint 檢查
pnpm lint

# 建構生產版本
pnpm build

# 預覽建構結果
pnpm preview
```

---

## 型別定義

### Country

```typescript
interface Country {
    zhName: string; // 中文名稱
    enName: string; // 英文名稱
    shortName: string; // 國家代碼 (如 TW)
    firstLetter: string; // 首字母
    code: string; // 電話國碼 (如 886)
    id: number; // 唯一識別碼
}
```

### CountrySelectorProps

```typescript
interface CountrySelectorProps {
    type: 'dialCode' | 'nationality';
    value?: string;
    defaultValue?: string;
    onChange?: (country: Country | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    hintText?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
}
```

---

## 使用場景

### 電話國碼選擇 (`dialCode`)

```tsx
<CountrySelector
    type="dialCode"
    label="電話國碼"
    defaultValue="886"
    onChange={(country) => {
        if (country) {
            console.log(`選擇了 +${country.code}`);
        }
    }}
/>
```

顯示格式：`+886 台灣`

### 國籍選擇 (`nationality`)

```tsx
<CountrySelector
    type="nationality"
    label="國籍"
    defaultValue="TW"
    onChange={(country) => {
        if (country) {
            console.log(`選擇了 ${country.zhName}`);
        }
    }}
/>
```

顯示格式：`台灣 Taiwan (TW)`

### 與其他表單元素並排

當 CountrySelector 與其他 input 並排使用時，可以透過 CSS 調整 dropdown 寬度：

```tsx
<div className="phone-input-group">
    <CountrySelector type="dialCode" />
    <input type="tel" placeholder="電話號碼" />
</div>
```

```css
/* 讓 dropdown 寬度對齊整個外層容器 */
.phone-input-group .country-selector__dropdown {
    width: calc((100% + 8px) * 4 - 8px); /* 根據 flex 比例調整 */
    max-width: none;
}
```

### 範例 4：外部資料與 loading 控制

模擬從 API 取得國家資料，並用 loading 控制 skeleton：

```tsx
function App() {
    const [data, setData] = useState({ hotList: [], list: [] });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setData({
                hotList: [
                    /* ... */
                ],
                list: [
                    /* ... */
                ],
            });
            setLoading(false);
        }, 1500);
    }, []);
    return <CountrySelector type="dialCode" dataSource={data} loading={loading} />;
}
```
