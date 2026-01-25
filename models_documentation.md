# Models Documentation & ER Diagram

## Application Data Overview
The Salon E-Commerce backend uses MongoDB with Mongoose. The data model is designed to support:
- Role-based interaction (Admin, Agent, Customer)
- E-Commerce flow (Products, Orders, Cart)
- Advanced Commission System (Slabs, Monthly Payouts, Wallet)
- Customer Loyalty System (Points, Eligibility Locking)

## ER Diagram Description

### User
The central entity.
- **Roles**: `CUSTOMER`, `AGENT`, `ADMIN`.
- **Relationships**:
    - One-to-Many `Order` (as Customer)
    - One-to-Many `Order` (as Agent/Referral)
    - One-to-One `AgentWallet` (if Agent)
    - One-to-Many `Commission` (as Agent)
    - One-to-Many `Transaction` (as User)

### Order
Represents a purchase.
- **Relationships**:
    - Belongs to `User` (Customer)
    - Optional Link to `User` (Agent)
    - Many-to-Many `Product` (via embedded items)
    - One-to-One `Commission` (if Agent linked)

### Commission
Tracks sales credit for Agents.
- **Key Logic**: Created as `PENDING` with null percentage on order. finalized to `PAID` with calculated percentage at month-end.
- **Fields**:
    - `agentId`: Ref User
    - `orderId`: Ref Order
    - `orderAmount`: Number
    - `percentageApplied`: Number (Nullable, set at payout)
    - `commissionAmount`: Number (Nullable, set at payout)
    - `status`: PENDING | APPROVED | PAID | REVERSED
    - `month`, `year`: For grouping

### AgentWallet
Stores current balance for Agents.
- **Fields**:
    - `agentId`: Ref User
    - `balance`: Number

### Transaction
Immutable ledger for all monetary movements (Wallet Credits, Reward Redemptions).
- **Fields**:
    - `userId`: Ref User
    - `walletType`: AGENT_WALLET | CUSTOMER_REWARD
    - `type`: CREDIT | DEBIT
    - `amount`: Number
    - `sourceType`: MonthlyPayout | RewardRedemption | CommissionReversal

### CommissionSlab
Defines dynamic rules for commission calculation.
- **Fields**:
    - `minSales`: Number
    - `maxSales`: Number
    - `percentage`: Number

## Model Details

### 1. User Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `role` | Enum | 'ADMIN', 'AGENT', 'CUSTOMER' |
| `customerProfile.rewardPoints` | Number | Loyalty points balance. |
| `customerProfile.rewardEligibleFromDate` | Date | Lock-in date (First Order + 3 Months). |
| `agentProfile.referralCode` | String | Unique code for linking orders. |

### 2. Order Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `customerId` | Ref User | The buyer. |
| `agentId` | Ref User | Linked agent (optional). |
| `commissionCalculated` | Boolean | Flag to prevent duplicate processing. |
| `status` | Enum | PENDING, PAID, SHIPPED, COMPLETED, CANCELLED |

### 3. Commission Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `percentageApplied` | Number | Final % used (populated at payout). |
| `commissionAmount` | Number | Final $ earned (populated at payout). |
| `month` | Number | Month of the order (1-12). |

### 4. Transaction Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `walletType` | Enum | Distinguishes between Real Money (Agent) and Points (Customer). |
| `type` | Enum | CREDIT (Add) or DEBIT (Subtract). |

### 5. CommissionSlab Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `minSales` | Number | Start of range. |
| `maxSales` | Number | End of range. |
| `percentage` | Number | % applied for this range. |
