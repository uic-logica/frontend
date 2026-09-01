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
 
## 4. Profile page: self-view (editable) + public view
 
### Purpose
 
A profile is a member's record inside LOGICA: who they are academically, and what
they have actually done with the club. It has two modes, the member's own profile
(editable) and another member's profile (read only). After looking at someone's
page, a member should know their name, major, graduation year, what they are
interested in, whether they hold a board role, and roughly how involved they have
been.
 
### Sections
 
The Profile page should contain the following sections in order:
 
1. Identity Header
2. About
3. Involvement Summary
4. Activity History
### Content
 
#### Identity Header
 
* Profile photo, or a monogram fallback when no photo is set
* Full name
* Membership role chip, shown only for BOARD and EXEC_BOARD
* Major and expected graduation year
* Optional LinkedIn and GitHub links
* Edit profile button, visible only to the profile's owner
#### About
 
* Short bio, up to 500 characters
* Areas of interest, chosen from a fixed list (for example: software engineering,
  data science, machine learning, cybersecurity, product, hardware)
* An optional "open to" line: internships, project teams, study groups
* UIC email address, visible only to the profile's owner
#### Involvement Summary
 
* Three counts, computed server side: events attended, posts made, forms submitted
* Each count links to the matching list in Activity History
* Forms submitted is visible only to the profile's owner. Events attended and posts
  made are visible to any signed-in member.
* Member since date, month and year
#### Activity History
 
* Events attended: event name, event date, and whether the member RSVP'd only or
  actually checked in
* Posts made: post type, first line of the post, and date, linking to the post in
  the feed
* Form submissions: form name, submission date and status, visible only to the
  profile's owner
* Each list shows the five most recent entries, with a link to the full list
Visibility rule for the page as a whole: name, photo, role, major, graduation year,
bio, interests, events attended and posts made are visible to any signed-in member.
Email address and form submissions are visible only to the profile's owner. No part
of a profile is visible to signed-out visitors.
 
Role display: MEMBER profiles carry no chip. A chip means this person can do
something other members cannot, such as post to the feed or run check-in, so only
BOARD and EXEC_BOARD are labeled.
 
Missing photo: show a monogram built from the member's initials on a solid color
block. The color is picked deterministically from the member's id, so the same
member always gets the same block, and initials are never rendered on a color that
fails the contrast bar set in the design doc.
 
### User Actions
 
Members viewing **their own** profile should be able to:
 
* Edit their photo, bio, major, graduation year, interests and links
* Save every change in one action, or cancel and discard all of them
* See a confirmation that the change was saved
* Open the full lists behind each involvement count, including their own form
  submissions
* Sign out
Members viewing **another member's** profile should be able to:
 
* Read that member's public details and involvement counts
* Open that member's public activity lists
* Follow their LinkedIn and GitHub links
* Navigate to other pages
Editing happens on the profile page itself. The Edit profile button turns the
Identity Header and About sections into a single form in place, with one Save
changes button and one Cancel. Fields are not saved individually. When the save
succeeds the page returns to read mode and shows a success message at the top of the
page which takes keyboard focus. If the save fails, everything the member typed
stays on the page.
 
### Empty State
 
A member who has just signed in and filled in nothing sees their name and role, and
an empty profile prompt in place of the About and Activity sections:
 
> **Your profile is empty**
>
> Add your major, graduation year and a short bio so other members know who you are.
 
with a **Complete your profile** button that opens edit mode. Another member looking
at that same profile sees "This member hasn't added profile details yet." and no
prompt.
 
A member with no involvement yet sees zeros in the Involvement Summary, and in place
of Activity History:
 
> **No involvement yet**
>
> Events you check in to and posts you make will show up here.
 
with a link to the calendar.
 
### Error States
 
* Profile does not exist: "We can't find that profile. It may have been removed, or
  the link may be wrong." with a link back to the Team page.
* Save fails: stay in edit mode, keep everything the member typed, and show an error
  summary at the top of the page listing every problem, each entry linking to the
  field it belongs to.
* Edit attempted on a profile that is not yours: the edit form is never rendered,
  and a direct request is answered with "You can only edit your own profile."
* Session expired while editing: "Your session has expired. Sign in again to save
  your changes." Keep the entered values and return the member to edit mode once
  they sign back in.
## 5. Feed page + post composer
 
### Purpose
 
The feed is where signed-in members land to see what is happening in LOGICA:
announcements, upcoming events and member spotlights. Everyone with an account can
read it; only BOARD and EXEC_BOARD can post to it. That split shapes the whole page.
 
### Sections
 
The Feed page should contain the following sections in order:
 
1. Post Composer
2. Pinned Announcements
3. Post List
### Content
 
#### Post Composer
 
* Rendered only for BOARD and EXEC_BOARD. Members who cannot post see nothing in
  this place, not a disabled composer.
* Collapsed state: a single-line prompt, "Post an update to LOGICA", next to the
  author's profile photo
* Expanded state, opening in place on the page rather than in a modal:
  * Post type: Announcement, Event or Spotlight
  * Body, up to 2,000 characters, with a character counter that appears at 1,800
  * Optional image, one per post
  * Optional linked event, chosen from upcoming events
  * Publish and Cancel
* A "Pin this announcement" checkbox, on Announcement posts only, for EXEC_BOARD only
#### Pinned Announcements
 
* Up to three pinned posts, above the main list
* Each carries a Pinned label
* A pinned post does not repeat in the main list below
#### Post List
 
* Reverse chronological, newest first
* 20 posts at a time, extended by a Load more button rather than endless scroll
* Each post shows:
  * Author photo and name, linking to their profile
  * Author role chip, BOARD or EXEC_BOARD
  * Post type label
  * Relative timestamp ("3 days ago"), with the full date and time available on
    hover and to screen readers
  * Body text, with URLs made clickable
  * The image, if there is one
  * A compact event card, if an event is linked, showing name, date, time and
    location, linking to the event page
  * An Edited label if the post was changed after publishing
Post types are told apart by the type label and the color of a rule down the left
edge of the card. They do not get different card layouts, so the feed still reads as
one list.
 
### User Actions
 
All signed-in members should be able to:
 
* Read the feed and open any post
* Open the author's profile from a post
* Open a linked event's page from a post
* Load more posts
Board and Exec Board members should additionally be able to:
 
* Write and publish a post
* Edit their own post within 15 minutes of publishing, after which the post carries
  an Edited label
* Delete their own post
* Pin and unpin an announcement (EXEC_BOARD only)
* Delete any post (EXEC_BOARD only)
There is no saved-draft state in this version. If publishing fails, the composer
stays open with everything the author typed still in it.
 
### Empty State
 
Before anyone has posted, the post list shows:
 
> **No posts yet**
>
> Announcements and event updates from the board will show up here.
 
Board and Exec Board members see the same message with a **Write the first post**
button that opens the composer.
 
The collapsed composer shows its prompt, "Post an update to LOGICA". The expanded
composer opens with the type already set to Announcement, an empty body field whose
label is visible rather than standing in as placeholder text, and Publish inactive
until the body has at least one character in it.
 
Members who cannot post see Pinned Announcements directly under the page heading,
with no gap where the composer would have been.
 
### Error States
 
* The feed fails to load: "We couldn't load the feed." with a Try again button. Any
  posts already on screen stay there.
* A post fails to send: keep the composer open with the text intact, and show "Your
  post wasn't published. Try again."
* Empty post: "Enter something to post."
* Post too long: "Your post is 2,140 characters. Shorten it to 2,000 characters or
  fewer." with the real count in the message.
* Posting attempted by a member whose role does not allow it: the composer is not
  rendered, and a direct request is answered with "Your role doesn't allow posting
  to the feed."
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
## 7. Attendance check-in flow + attendance history on profile
 
### Purpose
 
Attendance covers two things: the check-in flow used at the door of a LOGICA event,
and the attendance history a member sees on their own profile. It records who
actually showed up, which is not the same as who RSVP'd, and it feeds the involvement
summary in section 4.
 
### Sections
 
The Attendance pages should contain the following sections in order:
 
1. Member Check-In
2. Check-In Console
3. Live Attendance List
4. My Attendance History
### Content
 
#### Member Check-In
 
* One screen, one field. The heading names the event being checked into.
* A six-character check-in code field, uppercase, drawn from an alphabet that
  excludes 0, O, 1, I and L so a code cannot be misread across a room
* The field submits itself once the sixth character is entered, with no separate
  button press. A Check in button is still present for keyboard and screen reader
  users.
* Arriving by scanning the event's QR code fills the code in and submits it, so
  scanning is a single action
* On success: the event name, the check-in time, and "You're checked in."
* Links to the event page and to My Attendance History
#### Check-In Console
 
* Rendered only for BOARD and EXEC_BOARD
* The event name, its check-in window, and whether check-in is currently open
* The six-character code, set large enough to read from across a room, and the QR
  code for the same event
* A running count of members checked in
* Manual check-in: search a member by name or UIC email and check them in directly,
  for anyone whose phone is dead or who is not in the system yet
* Open check-in and Close check-in controls
#### Live Attendance List
 
* Newest first, updating as people check in
* Per entry: member photo, name, and the time they checked in
* Each name links to that member's profile
* A visible difference between members who checked themselves in and members added
  manually by a board member
* Export the list as CSV (EXEC_BOARD only)
#### My Attendance History
 
* Lives inside the Activity History section of the member's own profile described in
  section 4, and also has its own page for the full list
* Per event: event name, event date, and one of two states, Attended or "RSVP'd,
  didn't check in"
* Newest first
* A total count of events attended in the current academic year
Speed is the governing constraint on this page. Check-in happens at a door with
people waiting, so the target is one screen and one action per person, with the
confirmation on screen in under one second. In console mode the screen resets itself
for the next person three seconds after a successful check-in, and a Next person
button resets it immediately.
 
### User Actions
 
Members should be able to:
 
* Enter a check-in code, or scan the event QR code, and check themselves in
* See a confirmation that the check-in was recorded, with the time
* View their own attendance history
* See which events they RSVP'd to but did not attend
Whoever is running check-in (Board / Exec Board) should be able to:
 
* Open and close check-in for an event
* Display the event's check-in code and QR code
* Watch the live list and the count as people check in
* Check a member in manually by searching for them
* Remove a check-in that was recorded by mistake
* Export the attendance list for the event (EXEC_BOARD only)
### Empty State
 
An event where nobody has checked in yet shows, in place of the Live Attendance List:
 
> **No one has checked in yet**
>
> Members appear here as they check in. The code is shown above.
 
A member who has not attended anything yet sees, in place of their attendance
history:
 
> **No events yet**
>
> Check in at your first LOGICA event and it will show up here.
 
with a link to the calendar.
 
### Error States
 
* Invalid code: "That code isn't right. Check the code shown at the door and try
  again." The field keeps focus and clears itself.
* Expired code: "That code has expired. Ask a board member for the current code."
* Code for a different event: "That code is for [other event]. Check in for [this
  event] instead." with a link to the right check-in screen.
* Already checked in: not treated as an error. Show "You're already checked in" with
  the original check-in time.
* Event not open for check-in: "Check-in isn't open for this event yet." with the
  event date and time, or "Check-in for this event has closed."
* Check-in console opened by a member whose role does not allow it: "Your role
  doesn't allow running check-in."
* Check-in submitted but the request fails: "We couldn't record your check-in. Try
  again." Keep the code in the field.
## 8. Form renderer + startup-intake and company-visit-signup forms
 
### Purpose
 
This is a general-purpose form renderer, plus the two concrete forms built on top of
it, startup-partner intake and company-visit signup, plus a submissions view for
board members. The forms live on the LOGICA site rather than in Google Forms so that
submissions stay in our own database and tie back to member profiles, which is what
lets a submission count toward the involvement summary in section 4.
 
### Sections
 
The Forms pages should contain the following sections in order:
 
1. Form Renderer
2. Startup-Partner Intake
3. Company-Visit Signup
4. Submissions View
### Content
 
#### Form Renderer
 
* Input types it has to be able to draw: short text, long text, email, telephone,
  URL, single select, multiple select, date, file upload, and a consent checkbox
* Single select uses radio buttons at five options or fewer and a dropdown above
  that, so a short set of choices is readable without opening a menu
* Every input has a visible label. Placeholder text is never used in place of one.
* Required fields are marked in the label itself with the word "(required)", and an
  instruction above the form states how required fields are marked
* Optional hint text sits between the label and the input
* A validation message sits between the hint and the input, so it is read
  immediately before the field it belongs to, and the field itself takes a colored
  border
* When a submission fails validation, an error summary appears at the top of the
  page listing every problem, each entry linking to its field, and keyboard focus
  moves to that summary. The page `<title>` is prefixed with "Error:".
* The wording in the summary and the wording next to the field are identical
* A signed-in member has name, UIC email, major and graduation year filled in
  already, and can change any of them
* One primary submit button per form, and a second submission is blocked while the
  first is still in flight
#### Startup-Partner Intake
 
* Filled out by anyone, signed in or not, since the people submitting are usually
  from outside UIC
* Asks for: company or project name, contact name, contact email, website, what the
  company does, what they want from LOGICA (recruiting, mentorship, a company visit,
  project sponsorship, other), timeframe, and anything else they want to add
* After submitting: a confirmation page, not a toast, giving a reference number,
  restating the email address they entered, and saying that a board member replies
  within a stated number of business days
#### Company-Visit Signup
 
* Filled out by signed-in members only, because places are limited and attendance
  ties back to member records
* Asks for: which visit, whether they can make the travel time, dietary or
  accessibility needs, and a short reason for wanting to attend
* Shows the number of places left, and closes itself when the visit is full
* After submitting: a confirmation page giving the visit name, date and place, the
  submission's status, and a link to the event page
#### Submissions View
 
* Rendered only for BOARD and EXEC_BOARD
* One form at a time, newest submission first
* Per submission: submitter name (or contact name, on the intake form), submission
  date and time, status, and the first two answers as a preview
* Opening a submission shows every answer in the order the form asks them
* Filter by form, by status and by date range; search by submitter name or email
* Status is one of: New, In review, Accepted, Declined
* Export the current filtered list as CSV (EXEC_BOARD only)
Accessibility is checked in review on this page rather than left to the build. Every
input has a real `<label>` associated with it, the whole form can be completed with
the keyboard alone in a sensible order, focus is always visible, error messages are
associated with their fields so a screen reader announces them together, and no
control is smaller than the minimum target size set in the design doc.
 
### User Actions
 
Anyone filling out a form should be able to:
 
* Read what the form is for before starting it
* Complete and submit it using a keyboard alone
* See exactly which fields have problems and jump to each one from the summary
* Get a confirmation with a reference number after submitting
* Leave the page without submitting, understanding that nothing is stored until
  submit
Board and Exec Board members should additionally be able to:
 
* Open the submissions view for either form
* Read a full submission
* Filter, search and sort submissions
* Change a submission's status
* Export submissions as CSV (EXEC_BOARD only)
* Open or close a form to new responses
### Empty State
 
Before anything has been submitted, the submissions view shows:
 
> **No submissions yet**
>
> Responses to this form appear here as they come in.
 
with a link to the public form so a board member can preview it.
 
A form that is not accepting responses shows its title and description, no fields,
and one of:
 
> **This form isn't open yet**
>
> It opens on [date].
 
> **This form is closed**
>
> Thanks for your interest. Check the calendar for what's coming up next.
 
### Error States
 
* A required field left blank: "Enter your [field name]." next to the field, and the
  same words in the summary.
* A value in the wrong format: "Enter an email address in the format
  name@example.com."
* A file that is too large or the wrong type: "The file must be smaller than 10MB"
  and "The file must be a PDF, PNG or JPG."
* A submission that fails to send: keep every answer on the page and show "We
  couldn't send your form. Try again." Nothing the person typed is lost.
* A form that does not exist: "We can't find that form." with a link to the calendar.
* A submissions view opened by someone whose role does not allow it: "Your role
  doesn't allow viewing submissions."
