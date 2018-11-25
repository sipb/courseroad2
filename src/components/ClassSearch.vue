<template>
  <div>

    <h1>Class Search</h1>
    <input v-model="nameInput" placeholder="6.0061 Silly Systems" type="text"/>
    <h4> Search: {{ nameInput}} </h4>
    <h4> Results: </h4>
    <ul>
      <li v-for="subjectName in autocomplete">{{ subjectName }}</li>
    </ul>
  </div>
</template>

<script>

  export default {
    name: "ClassSearch",
    props: ['subjects'],
    data: function () {
      return {
        nameInput: ""
      }
    },
    computed: {
      autocomplete: function () {
        return this.subjects.map(subject => subject.id).filter(name => {
          return this.nameInput !== "" && this.nameInput <= name.length && name.indexOf(this.nameInput) === 0;
        });
      }
    }
  }
</script>

<style scoped>

</style>