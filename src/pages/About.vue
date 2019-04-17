<template>
  <v-container>
    <router-link to="/" style="color: inherit; text-decoration: none;">
      <v-btn icon flat>
        <v-icon>arrow_back</v-icon>
      </v-btn>
    </router-link>
    <div class="text-sm" style="margin: 0px 60px;">
      <h1>About CourseRoad</h1>
      <p class="px-3">CourseRoad is a student-run academic planner for MIT students.
        It allows students to plan out their degrees, test out paths for different
        majors, and view class information. CourseRoad is integrated with FireRoad,
        so you can download the FireRoad app to plan your degree on the go!
      </p>
      <h2>Github Repository</h2>
      <p class="px-3">The Github repository is open-source and located at
        <a href="https://github.com/npfoss/courseroad2">CourseRoad 2</a>.
      </p>
      <h2>Known Issues</h2>
      <p class="px-3">
        <ul style="display: inline-block;">
          <li>
            <h3>Scrolling issues</h3>
            <p>The semester view does not scroll adaptively when you are dragging
              classes into it. We are working to fix this.
            </p>
          </li>
          <li>
            <h3>Open search on click</h3>
            <p>The search bar sometimes fails to open when you click on it. This seems to be
              computer/browser-dependent, and we are investigating. It should always open
              when you start typing to search for a class.
            </p>
          </li>
          <li>
            <h3>Responsiveness on mobile devices</h3>
            <p>CourseRoad is intended for non-mobile screen sizes. If you want to
              use a similar tool on your phone, check out the FireRoad app (see below).
            </p>
          </li>
        </ul>
      </p>
      <h2>Maintainers</h2>
      <p class="px-3">
        <ul style="display: inline-block;">
          <li>Nate Foss</li>
          <li>Georgia Shay</li>
          <li>Sophie Mori</li>
          <li>Michael Nguyen</li>
        </ul>
      </p>
      <h3 class="px-3">Past</h3>
      <p class="px-3">
        <ul style="display: inline-block;">
          <li>Danny Ben-David</li>
        </ul>
      </p>
      <p class="px-3">If you have questions or comments, please <a href="mailto:courseroad@mit.edu">email</a> us.</p>
      <h2>FireRoad</h2>
      <p class="px-3">We would like to thank FireRoad for collaborating with us
        on this project and allowing us to integrate the two services. FireRoad
        is available on for Android and iOS. To read more about FireRoad or request
        an update to course requirements, visit the <a href="https://fireroad.mit.edu">
        FireRoad website</a>.
      </p>
      <h3 class="px-3">Github Respositories</h3>
      <p class="px-3">
        <ul style="display: inline-block;">
          <li><a href="https://github.com/venkatesh-sivaraman/FireRoad">iOS App</a></li>
          <li><a href="https://github.com/venkatesh-sivaraman/FireRoad-Android">Android App</a></li>
          <li><a href="https://github.com/venkatesh-sivaraman/fireroad-server">FireRoad Server</a></li>
        </ul>
      </p>
      <a name="fireroad"></a>
      <p class="px-3">Download the app for <a href="https://itunes.apple.com/us/app/fireroad-mit-course-planner/id1330678450">iOS</a>
        or <a href="https://play.google.com/store/apps/details?id=com.base12innovations.android.fireroad&hl=en_US">Android</a>.
      </p>
      <h2>Old CourseRoad</h2>
      <p class="px-3">The old CourseRoad has been moved to <a href="https://courseroad.mit.edu/old">courseroad.mit.edu/old</a>.</p>
      <p class="px-3">You can export your roads from the old CourseRoad and
        import them here to transfer your data.
      </p>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "About"
}
</script>
