# The Application – Food Delivery for Shipper

## Quick preview

This is a android application designed for shippers to manage and deliver food orders efficiently.

It has some basic function: 
- Authentication: Login, Register, Forget password.
- Delivery: Receive order and delivering it.
- History orders: See orders that shipper used to deliver
- Personal information: update personal details, change password.

## Features

#### Authentication

- Login using email and password, with optional fingerprint authentication.
- Registration requests are sent to the administration for approval.
- "Forgot password" option sends a reset link directly to your email.

#### Delivery

- Receive orders through notifications (when the store marks an order as ready) or from a list of completed orders.
- Delivery workflow consists of three steps:
1.  Pick up order: Go to the store to collect the order. You can only cancel the order at this stage.
2. Deliver to customer: Follow the map for directions.
3. Mark as finished: Complete the delivery.
- Integrated map for navigation and route guidance.

#### Order History

- View previously delivered orders.

#### Profile

- Update personal information.
- Change password.
- Configure fingerprint authentication.

## Technology Stack

- Language: Java
- Platform: Android

## Related Repositories

You can check out some related repositories below:

- [Server](https://github.com/BuiAnh12/graduation_project_backend) - Backend server that powers the application
- [Client](https://github.com/BuiAnh12/graduation_project_frontend_client) - Customer-facing site for browsing and ordering food.
- [Admin](https://github.com/bppham/graduation_project_admin_food_app) - Administration dashboard for managing the system.
- [Store](https://github.com/BuiAnh12/graduation_project_frontend_store) - Store management site for handling menus, orders, staff, and analytics.

## Feedback & Contributions

- Your feedback and contributions are always welcome!
- Feel free to open an issue or submit a pull request if you'd like to improve the project.