<!-- this is a cool idea for class info on click: https://vuetifyjs.com/en/components/expansion-panels#popout-inset -->

<template>
  <v-flex md3 xs4>
    <v-card
      :class="[{classbox: true, satisfied: isSatisfied}, courseColor]"
      draggable
      v-on:drag = "drag"
      v-on:dragend = "drop"
      v-on:click = "$emit('click-class',classInfo)"
    >
      <v-icon style = "margin: 4px" small @click = "$emit('remove-class',classInfo)">cancel</v-icon>
      <v-card-text class="card-text"><b>{{classInfo.id}}:</b> {{classInfo.title}}</v-card-text>

<!--
     <v-container
      height="200px"
      fluid
      pa-2
    > -->

    </v-card>
  </v-flex>
</template>

<script>
export default {
  name: "class",
  props: ['classInfo','semesterIndex'],
  computed: {
    courseColor () {
      let course  = this.classInfo.id.split('.')[0]
      if (this.validCourses.indexOf(course) !== -1) {
        return 'course-' + course
      } else {
        return 'course-none'
      }
    }
  },
  data() {
    return {
      isSatisfied: true,
      dragSemesterNum: -1,
      validCourses: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
        '11', '12', '14', '15', '16', '17', '18', '20', '21', '21A', '21W',
        'CMS', '21G', '21H', '21L', '21M', 'WGS', '22', '24', 'CC', 'CSB',
        'EC', 'EM', 'ES', 'HST', 'IDS', 'MAS', 'SCM', 'STS', 'SWE', 'SP'
      ]
    }
  },
  methods: {
    drag: function(event) {
      this.$emit("drag-class",{
        drag: event,
        basicClass: this.classInfo,
        isNew: false,
        currentSem: this.semesterIndex
      });
    },
    drop: function(event) {
      this.$emit("drop-class",{
        drop: event,
        basicClass: this.classInfo,
        isNew: false,
        currentSem: this.semesterIndex
      });
    }
  }
}
</script>


<style scoped>
  .card-text {
    color: white;
    font-size: 1.1em;
    padding-top: 0;
  }

  .classbox {
    height: 9em;
    padding-top: 0;
    overflow:hidden;
  }

  .satisfied {
    background: #00b300;
  }
  /* this is a bad color, change it */
  .unsatisfied {
    background: #eb7e7e;
  }

  /* Colors obtained from
  https://github.com/venkatesh-sivaraman/fireroad-server/blob/develop/requirements/static/requirements/css/req_preview.css */
  .course-none { background-color: #999; }

  .course-1 { background-color: #DE4343; }
  .course-2 { background-color: #DE7643; }
  .course-3 { background-color: #4369DE; }
  .course-4 { background-color: #57B563; }
  .course-5 { background-color: #43DEAF; }
  .course-6 { background-color: #4390DE; }
  .course-7 { background-color: #5779B5; }
  .course-8 { background-color: #8157B5; }
  .course-9 { background-color: #8143DE; }
  .course-10 { background-color: #B55757; }
  .course-11 { background-color: #B55773; }
  .course-12 { background-color: #43DE4F; }
  .course-14 { background-color: #DE9043; }
  .course-15 { background-color: #B55C57; }
  .course-16 { background-color: #43B2DE; }
  .course-17 { background-color: #DE43B7; }
  .course-18 { background-color: #575DB5; }
  .course-20 { background-color: #57B56E; }
  .course-21 { background-color: #57B567; }
  .course-21A { background-color: #57B573; }
  .course-21W { background-color: #57B580; }
  .course-CMS { background-color: #57B58C; }
  .course-21G { background-color: #57B599; }
  .course-21H { background-color: #57B5A5; }
  .course-21L { background-color: #57B5B2; }
  .course-21M { background-color: #57ACB5; }
  .course-WGS { background-color: #579FB5; }
  .course-22 { background-color: #B55757; }
  .course-24 { background-color: #7657B5; }
  .course-CC { background-color: #4FDE43; }
  .course-CSB { background-color: #579AB5; }
  .course-EC { background-color: #76B557; }
  .course-EM { background-color: #576EB5; }
  .course-ES { background-color: #5A57B5; }
  .course-HST { background-color: #5779B5; }
  .course-IDS { background-color: #57B586; }
  .course-MAS { background-color: #57B55A; }
  .course-SCM { background-color: #57B573; }
  .course-STS { background-color: #8F57B5; }
  .course-SWE { background-color: #B56B57; }
  .course-SP { background-color: #4343DE; }
</style>
