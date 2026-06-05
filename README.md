# CalcLock

**CalcLock** is a full-stack concept web application that explores modern paywall and subscription culture by locking calculator results behind a Stripe payment.

## Concept

What if even a simple calculator charged users to reveal the answer?

CalcLock was built as a creative full-stack project to demonstrate how a basic utility can be transformed into a premium payment-based digital service.

## Features

- Modern calculator UI
- Locked calculation results
- Stripe Checkout payment integration
- Automatic answer unlock after successful payment
- MongoDB calculation history
- Paid / locked status tracking
- Clear history feature
- Premium glassmorphism design

## Tech Stack

### Frontend
- React.js
- Axios
- CSS3

### Backend
- Spring Boot
- Java
- REST APIs
- Stripe Java SDK

### Database
- MongoDB Atlas

### Payment
- Stripe Checkout

## Project Flow

1. User enters a calculation.
2. Backend calculates and stores the answer.
3. Answer is hidden from the user.
4. User completes payment through Stripe.
5. After successful payment, the answer is unlocked.
6. Calculation history is stored in MongoDB.

## Screenshots

Add screenshots here:

```md
![Calculator UI](screenshots/calculator.png)
![Stripe Checkout](screenshots/stripe.png)
![History](screenshots/history.png)
