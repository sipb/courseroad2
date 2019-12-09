<template>
  <v-container>
    <router-link to="/" style="color: inherit; text-decoration: none;">
      <v-btn icon text>
        <v-icon>arrow_back</v-icon>
      </v-btn>
    </router-link>
    <div class="text-sm" style="margin: 0px auto; max-width: 48em;">
      <h1>About CourseRoad</h1>
      <p class="px-4">
        CourseRoad is a student-run academic planner for MIT students.
        It allows students to plan out their degrees, test out paths for different
        majors, and view class information. CourseRoad is integrated with FireRoad,
        so you can download the FireRoad app to plan your degree on the go!
      </p>
      <p class="px-4">
        This is always a work in progress! If you have feature requests or
        want to contribute, the source code is open source and located on
        <a target="_blank" href="https://github.com/npfoss/courseroad2">Github</a>.
      </p>
      <p class="px-4">
        We would like to thank the Office of the First Year and the
        Student Information Processing Board for all their support with this project.
      </p>
      <h2>Known Issues</h2>
      <p class="px-4">
        <ul style="display: inline-block;">
          <li>
            <h3>Class year</h3>
            <p>
              Yeah, changing your class year is really unintuitive right now, sorry about that.
              The way to do it now is to click on a year number (e.g. "2021").
            </p>
          </li>
          <li>
            <h3>Slow page load</h3>
            <p>
              We haven't done much optimization for loading time yet,
              but we recognize that it's annoying an are working on it.
            </p>
          </li>
          <li>
            <h3>Slow drag and drop</h3>
            <p>
              There's a noticable delay between dragging and dropping a subject
              and the page updating and letting you do things again.
            </p>
          </li>
          <li>
            <h3>Scrolling while dragging</h3>
            <p>
              The semester view does not scroll adaptively when you are dragging
              classes into it.
            </p>
          </li>
          <li>
            <h3>Open search on click</h3>
            <p>
              The search bar sometimes fails to open when clicked on. This seems to be
              computer/browser-dependent, and we are investigating. It should open
              when you start typing to search for a class.
            </p>
          </li>
          <li>
            <h3>Degree audit</h3>
            <p>
              It's never going to be perfect, because the audit is presented in English,
              which allows unlimited flexibility and annoying edge cases.
              However, we should be able to handle most normal use cases
              so be sure to submit mistakes through the
              <a target="_blank" href="https://fireroad.mit.edu/requirements/">
                requirements editor
              </a>.
              We're also working on handling petitions and overrides for the audit,
              which we know is important for a lot of people.
            </p>
          </li>
          <li>
            <h3>Responsiveness on mobile devices</h3>
            <p>
              CourseRoad is intended for non-mobile screen sizes. If you want to
              use a similar tool on your phone, check out the FireRoad app (see below).
            </p>
          </li>
          <li>
            <h3>And probably others...</h3>
            <p>
              See the full, most up to date list of issues on <a target="_blank" href="https://github.com/sipb/courseroad2/issues">GitHub</a>.
            </p>
          </li>
        </ul>
      </p>
      <h2>Old CourseRoad</h2>
      <p class="px-4">
        The old CourseRoad has been moved to <a target="_blank" href="https://courseroad.mit.edu/old">courseroad.mit.edu/old</a>.
        You can export your roads from the old CourseRoad and import them here to transfer your data.
      </p>
      <h2>FireRoad</h2>
      <p class="px-4">
        We would like to thank FireRoad for collaborating with us
        on this project and allowing us to integrate the two services. FireRoad
        is available on for Android and iOS. To read more about FireRoad or request
        an update to course requirements, visit the <a target="_blank" href="https://fireroad.mit.edu">
          FireRoad website</a>.
      </p>
      <h3 class="px-4">
        Github Repositories
      </h3>
      <p class="px-4">
        <ul style="display: inline-block;">
          <li><a target="_blank" href="https://github.com/venkatesh-sivaraman/FireRoad">iOS App</a></li>
          <li><a target="_blank" href="https://github.com/venkatesh-sivaraman/FireRoad-Android">Android App</a></li>
          <li><a target="_blank" href="https://github.com/venkatesh-sivaraman/fireroad-server">FireRoad Server</a></li>
        </ul>
      </p>
      <a name="fireroad" />
      <p class="px-4">
        Download the app for <a target="_blank" href="https://itunes.apple.com/us/app/fireroad-mit-course-planner/id1330678450">iOS</a>
        or <a target="_blank" href="https://play.google.com/store/apps/details?id=com.base12innovations.android.fireroad&hl=en_US">Android</a>.
      </p>

      <h2>Maintainers</h2>
      <p class="px-4">
        <ul style="display: inline-block;">
          <li>Nate Foss (npfoss)</li>
          <li>Georgia Shay (gshay)</li>
          <li>Michael Nguyen (mwnguyen)</li>
          <li>Sophie Mori (ksmori)</li>
        </ul>
      </p>
      <h3 class="px-4">
        Past
      </h3>
      <p class="px-4">
        <ul style="display: inline-block;">
          <li>Danny Ben-David</li>
        </ul>
      </p>
      <p class="px-4">
        If you have questions or comments, please <a target="_blank" href="mailto:courseroad@mit.edu">email</a> us.
      </p>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'About'
};
</script>
