# LOGICA Website Content Specification Overview

This document defines the information and content that each page of the
LOGICA website should contain. It describes each page's purpose, sections,
content, user actions, and empty states.

---

## 1. Landing Page

### Purpose

The goal of the landing page is to introduce LOGICA, explain who the
organization serves, and guides visitors to important areas of the website.

### Sections

The landing page should contain the following sections in order:

1. Introduction to LOGICA
2. Organization Mission
3. Upcoming Events
4. Featured Content
5. Call to Action

### Content

#### Introduction to LOGICA

*  LOGICA name
*  Brief description of the organization
*  Information about who LOGICA serves

#### Organization Mission

* LOGICA's mission statement
* Goals of the organization
* Brief description of what LOGICA provides to its members

#### Upcoming Events

* Event name
* Event date
* Event time
* Event location
* Brief event description
* Link to the event detail page

#### Featured Content

* Featured LOGICA announcements, projects, or community content
* Title of the featured content
* Short description
* Link to the relevant page

#### Call to Action

* Information encouraging visitors to learn more about LOGICA
* Links to relevant pages such as the Team, Calendar, or Sign-In pages

### User Actions

Visitors should be able to:

* Learn about LOGICA
* View upcoming events
* View the event calendar
* Learn about the LOGICA team
* Sign in
*  Navigate to other pages

### Empty State

If there are no upcoming events or featured content, the page should
still display LOGICA's basic information, mission, and navigation.

## 2. Team / roles page

### Purpose

The goal of the Team / Roles page is to introduce the people who are part of LOGICA, including the Board and the people who build and maintain the LOGICA website.

### Sections

The Meet the Team page should contain the following sections in order:

1. Meet the Team
2. Pictures of Board 

### Content

#### Meet The team

* Title Meet the team
* Pictures of the Board Members
* Information about each board Members role/position.
* Link to Linkedin

#### Pictures of the Board
* Photos of each Board Member


### User Actions

Visitors should be able to:

* Learn about LOGICA Board Members
* Navigate to other pages

### Empty State

If team member information is unavailable:
Display a message indicating that team information is coming soon.
Use a default profile image if a team member's photo is unavailable.

## 3. Sign-in screen + session/role check

### Purpose
Make sure the app knows who you are and who you're allowed to before you access member only features.

### Sections

The Sign-in page should contain the following sections in order:

1. Welcome / LOGICA @ UIC
2. UIC Email Sign-In
3. Verification
4. Session / Role Check

### Content

#### Welcome / LOGICA @ UIC

* LOGICA @ UIC title or logo
* Short message explaining that members should sign in using their UIC email.
* Clear indication that the platform is for LOGICA @ UIC members.

#### UIC Email Sign-In

* Title: Sign in to LOGICA
* Field for UIC `.edu` email address
* Sign-in / Continue button
* Message explaining that no password is required.
* Only UIC email addresses should be accepted.

#### Verification

* One-time verification code and/or passkey authentication.
* Clear instructions for completing verification.
* Option to request a new verification code if needed.
* Error message for an invalid or expired code.

#### Session / Role Check

After successful authentication, the system should identify the user's membership role:

* **MEMBER** — standard member access
* **BOARD** — board member access
* **EXEC_BOARD** — executive board access

The user's role determines which features and actions they are allowed to access throughout the application.

### User Actions

Visitors/members should be able to:

* Enter their UIC email.
* Complete the verification process.
* Sign in to their LOGICA account.
* Access member-only pages after authentication.
* See content and actions appropriate for their role.
* Sign out of their account.

### Empty State

If a user is not signed in:

* Display a clear message explaining that the page requires authentication.
* Provide a **Sign In** button.
* Do not display member-only content or functionality.

Example:

> **Sign in to continue**
> Please sign in with your UIC email to access LOGICA member features.

### Error States

The sign-in screen should also handle:

* Invalid email address
* Non-UIC email address
* Invalid verification code
* Expired verification code
* Failed authentication
* Session expired
* Unauthorized access

For unauthorized access, display a message such as:

> **You don't have permission to access this page.**
>
> Your current role does not have access to this feature.

4. Not Finished 
5. Not Finished 

## 6. Calendar + event pages

### Purpose
The goal is to provide a LOGICA @ UIC event calendar where users can easily find upcoming events and view important event information, including the date, time, location, and description.

The calendar should allow users to discover events, register for events when applicable, and access additional event information based on their registration or acceptance status.

### Sections

The Calendar + events pages should contain the following sections in order:

1. Google Calendar 
2. Upcoming Events
3. Event Details
4. Past Events

### Content

#### Google Calendar

* Display upcoming LOGICA events in a calendar view.
* Users should be able to view events by date.
* The calendar should be compatible with external calendar platforms when possible.
* Users should have the option to add or export LOGICA events to their preferred calendar application.
* The implementation may use a custom LOGICA calendar rather than relying directly on Google Calendar.
  
#### Upcoming Events
* Display a list of upcoming events.
* Each event should include relevant information such as the event name, date, time, location, and description.
* Event Details
* Each event should have its own page.
* Include event information, RSVP functionality, and a shareable link.
* Provide an option to add the event to an external calendar.
  
#### Past Events
* Display previously held LOGICA events.
* Allow users to view basic information about past event
  
### User Actions

Visitors should be able to:

* Find and view upcoming LOGICA events.
* View publicly available event information, including the event name, date, time, location, and description.
* Navigate to other pages on the LOGICA website.
* Register or RSVP for events when registration is available.
* See the status of their registration (e.g., pending, accepted, or declined).
* Access additional event information after being accepted to an event when applicable.
* Add events to their preferred external calendar.
* Share an event using its shareable link.
  
### Empty State

If there are no upcoming LOGICA events:
  * No upcoming events
  * Check back soon for upcoming LOGICA events and activities.

## 7. Not Finished 

