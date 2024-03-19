Deployed on Vercel: https://tours-eta-olive.vercel.app/

Project Description

- This is a Nature tour application, where users can book different tours.
- Features:
  - Email
    - Welcome email, password reset, payment confirmation email
  - Payment
    - Accept credit card payment
  - Bookings
    - Allow user to add booking
    - Admin/lead-guide have CRUD access
  - Reviews
    - Allow users to create and read reviews
  - Users and roles
    - Prevent access to certain functionality based on roles
  - Authentication
    - Prevent access to certain functionality based on logged in status
- Technologies:
  - Node
  - PUG
  - HTML, CSS, JS

To do:

BackEnd

- Implement restriction - users can only review toors they've booked
- Nested booking routes - /tours/:id/bookings and /users/:id/bookings
- Improve tour dates - add participants and soldOut field to each date . . . When a user wants to book, they first need to check if the tour is available on that date (participants <= maxGroupSize)
- Implement advanced authentication features: confirm email, refresh tokens, two-factor authentication, etc.

FrontEnd

- Implement sign up form
- on tour detail page -- add a review directly on the website
- Hide the entire booking section on detail page if user has already booked the tour (prevent duplicate bookings)
- Implement "like tour" functionality, with favourite tour page
- My Reviews page -- edit/delete option
- Move all frontend to React
- Admin - Manage page -- CRUD tours, users, reviews and bookings
