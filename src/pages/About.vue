<template>
  <v-container>
    <router-link to = "/" style = "color: inherit; text-decoration: none;">
      <v-btn icon flat>
        <v-icon>arrow_back</v-icon>
      </v-btn>
    </router-link>
    <div class = "text-sm-center pa-2">
      <h1>About CourseRoad</h1>
      <p class = "px-5">CourseRoad is a an academic planner for MIT students.  It allows students to
        plan out their degrees, test out different majors, and view class information.
        CourseRoad integrates with FireRoad, so you can download the FireRoad app to
        plan your degree on the go!
      </p>
      <h2>Github Repository</h2>
      <p class = "px-5">The github repository is located at
        <a href = "https://github.com/npfoss/courseroad2">CourseRoad 2</a>.
      </p>
      <h2>FireRoad</h2>
      <p class = "px-5">We would like to thank FireRoad for collaborating with us on this project,
        and allowing us to integrate the two services.  FireRoad is available on
        the app store for Android and iOS.  To read more about FireRoad or request
        an update to course requirements, visit <a href = "fireroad.mit.edu">the fireroad website</a>.
      </p>
      <p>Github Respositories:</p>
      <p class = "px-5"><div>
        <ul style = "display: inline-block; text-align: left;">
          <li><a href = "https://github.com/venkatesh-sivaraman/FireRoad">iOS App</a></li>
          <li><a href = "https://github.com/venkatesh-sivaraman/FireRoad-Android">Android App</a></li>
          <li><a href = "https://github.com/venkatesh-sivaraman/fireroad-server">FireRoad Server</a></li>
        </ul>
      </div></p>
      <p class = "px-5">Download the app for <a href = "https://itunes.apple.com/us/app/fireroad-mit-course-planner/id1330678450">iOS</a>
        or <a href = "https://play.google.com/store/apps/details?id=com.base12innovations.android.fireroad&hl=en_US">Android</a>
      </p>
      <h2>Maintainers</h2>
      <p class = "px-5">
        <div>
          <ul style = "display: inline-block; text-align: left">
            <li>Nate Foss</li>
            <li>Sophie Mori</li>
            <li>Michael Nguyen</li>
            <li>Georgia Shay</li>
          </ul>
        </div>
      </p>
      <p class = "px-5">If you have questions or comments, please email <a href = "courseroad-dev.mit.edu">us</a>.</p>
      <h2>Old CourseRoad</h2>
      <p class = "px-5">The old courseroad has been moved to <a href = "courseroad.mit.edu/old">courseroad.mit.edu/old</a></p>
      <p class = "px-5">You can export your roads from the old CourseRoad and import them into the new
        CourseRoad to transfer your data.
      </p>
      <h2>Known Issues</h2>
      <p class = "px-5">
        <div>
          <ul style = "display: inline-block; text-align: left;">
            <li>
              <h3>Scrolling Issues</h3>
              <p>The semester view does not scroll correctly while you are dragging classes
                into it. We are working to fix this.
              </p>
            </li>
          </ul>
        </div>
      </p>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "About"
}
</script>
