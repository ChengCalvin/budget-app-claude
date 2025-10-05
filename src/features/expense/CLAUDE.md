# CLAUDE.md - Expense Feature Context

## Application Overview
This context is specifically scoped to the **expense management feature** of a personal budgeting application. All discussions, code, and functionality should be focused exclusively on expense-related operations.

## Feature Scope: Expense Management

### Core Functionality
The expense feature handles all aspects of recording, categorizing, and managing user expenses within the budgeting application.

### Key Components

#### 1. Expense Data Model
- **Expense ID**: Internal use only (not visible to users)
- **Amount**: Multi-currency support, 2 decimal places precision, no minimum limit, negative amounts not allowed
- **Label**: Plain text, maximum 26 characters, required field
- **Description**: Plain text, maximum 50 words, optional field
- **Category**: Required field with 5 predefined categories (Food, Transportation, Entertainment, Utilities, Other) + unlimited custom categories (15 character limit, alphanumeric only), flat structure, "Other" as default, case-sensitive duplicate validation
- **Date**: Date only (no time), user's local timezone based on phone region, selectable range from January 1, 2008 to unlimited future dates, defaults to today, required field
- **Receipt**: Optional multiple image attachments (JPG, PNG, PDF, JPEG formats), 10MB limit per file, cloud storage, OCR planned for automatic data extraction

#### 2. Expense Operations
- **Add Expense**: Bottom sheet form with fields (amount, label, category, description, date, optional images), required fields (amount, label, category, date), real-time validation for invalid input, duplicate detection on submit (refined later)
- **Edit Expense**: All fields editable, no time restrictions, edit history/audit trail, granular receipt management (add multiple, remove individual), confirmation required before saving
- **Delete Expense**: Hard delete with complete removal including all attachments
- **View Expenses**: View all expenses by default, lazy loading with 10 expenses per batch, scrollable card layout showing category (colored tag), amount, date, summary showing monthly and YTD expense totals, sort by date (day/month/year/all/range) and category
- **Search Expenses**: Real-time search across description and category fields, advanced filters for amount ranges and date ranges

#### 3. Expense Categories
- **Category Management**: Custom categories can have colors, cannot have case-sensitive duplicate validation, can rename updates all related expenses, can have deletion prompts about affected expenses before reverting them to "Other"
- **Category Analytics**: Show totals (YTD and monthly), default to current month unless filtered, numerical summaries (charts for later versions), percentage of total expenses based on the selected date filter

#### 4. Expense Analytics
- **Time-based Summaries**: Navigate between periods (previous/next day/month/year), weekly summaries start on Sunday, quick filters (7/30/90 days), show empty periods with $0 expenses
- **Category Breakdowns**: Covered in Category Analytics section
- **Basic Trends**: Placeholder for future refinement

### User Interface Considerations
- **Expense Entry**: Bottom sheet form, frequently used categories at top of selector, simple number pad for amount entry
- **Visual Design**: Category displayed as colored tag, equal visual weight for all amounts, receipt icon indicator for expenses with attachments
- **Mobile Responsive**: Mobile-first prioritization with responsive design, maximize card density with minimal spacing, support both portrait and landscape orientations (portrait primary)
- **Accessibility**: Skipped for initial version

### Data Validation
- **Amount**: Multi-currency support with currency conversion validation, maximum 2 decimal places (reject more), no maximum limit
- **Required Fields**: Validation on submit attempt only, flash required fields in red for errors, disable submit button until all required fields filled
- **Date**: Programmatic date picker range from January 1, 2008 to unlimited future dates
- **Category**: Prevent similar names (case variations), alphanumeric characters only, 15 character limit including spaces, prevent empty names or names with only spaces

### Integration Points
- **Backup and Data Sync**: Automatic real-time cloud sync, offline capabilities available, restore feature for later refinement

## Technical Constraints
- **Module Scope**: All functionality stays within expense feature module using this CLAUDE.md context
- **Performance**: 10 expenses per lazy load batch, client-side image compression, caching strategy and performance targets to be determined
- Focus only on expense-related database schemas, APIs, and UI components
- Exclude income tracking, investment management, or other budgeting features
- Maintain clear separation between expense logic and other application modules

## Out of Scope
- Income management
- Investment tracking
- Bill reminders
- Financial goal setting
- Account management (beyond expense-related operations)
- User authentication (unless specifically related to expense data security)
- Payment method tracking
- Tags functionality
- Budget allocation and comparisons
- Export capabilities
- Advanced trends analysis
- Charts and visual analytics (planned for later versions)

---

**Note**: When working with this context, all code examples, feature discussions, and implementation details should be limited to the expense management functionality described above.