# Bitespeed - Identity Reconciliation Backend Task

## ✅ Problem Statement

Build an API to **identify a user** uniquely based on multiple identifiers — email and phone number — while merging linked contacts using a primary/secondary contact system.

---

## 🚀 Hosted URL

🔗 **Live Endpoint:**  
[https://bitespeed-backend-identity-resolver.onrender.com/identify](https://bitespeed-backend-identity-resolver.onrender.com/identify)

> **POST /identify**  
> Accepts a JSON body with either `email`, `phoneNumber`, or both.

---

## 📦 Technologies Used

- Node.js + Express
- TypeScript
- Prisma ORM
- MySQL (Aiven Cloud)
- Jest + Supertest (for unit testing)
- Hosted on [Render](https://render.com)

---

## 📮 API Endpoint

### POST `/identify`

#### 📤 Request Body:
```json
{
  "email": "john@example.com",
  "phoneNumber": "1234567890"
}
```

#### ✅ Success Response:
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["john@example.com", "doe@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": [2]
  }
}
```

#### ❌ Error (if no identifiers):
```json
{
  "error": "Either email or phoneNumber is required."
}
```

---

## 🔁 Logic Summary

- New contact → added as **primary**
- Existing contact with new email or phone → added as **secondary**
- If both email & phone exist, consolidate & merge primaries
- All identifiers returned in deduplicated array

---

## 🧪 Test Coverage

Tested all scenarios:
- New primary contact creation
- Existing contact lookup
- New secondary creation
- Merge of multiple primaries
- Edge cases like missing email/phone

> Run tests locally with:
```bash
npm run test
```

---

## 🛠️ Run Locally

1. Clone the repo
2. Create `.env` and set:
   ```env
   DATABASE_URL=your_mysql_connection_string
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

4. Push schema to DB:
   ```bash
   npx prisma db push
   ```

5. Run the server:
   ```bash
   npm run dev
   ```

---

## ✅ Submission Checklist

- [x] GitHub repo with commits
- [x] /identify endpoint exposed
- [x] Hosted on Render
- [x] Test cases written & passed
- [x] `.env` excluded via `.gitignore`

---
