/** Routes visited in the BuddyTime app. Playwright resolves these against baseURL. */
export enum AppRoute {
  Landing = '/',
  Login = '/login',
  Signup = '/signup',
  ForgotPassword = '/forgot-password',
  Dashboard = '/app',
  Calendar = '/calendar',
  Friends = '/friends',
  Communities = '/communities',
  CreateCommunity = '/communities/new',
  Availability = '/availability',
  Playdates = '/playdates',
  PlaydatesNew = '/playdates/new',
  Birthdays = '/birthdays',
  Profile = '/profile',
  Admin = '/admin',
}
