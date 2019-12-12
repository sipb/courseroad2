<template>
    <v-card>
      <center>
			  <v-btn class="white--text" color="green" @click="viewDialog = true">
				  Create a Custom Activity				
			  </v-btn>
	    </center>
        <v-dialog v-model="viewDialog" max-width="600">
            <v-card>
                <v-btn icon flat style="float:right" @click="viewDialog=false">
                  <v-icon>close</v-icon>
                </v-btn>
                <v-card-title>
                  <h2>Custom Activities</h2>
                </v-card-title>
                <v-form>
                  <div class="px-3">
                    <v-text-field label="Short Title" counter=8></v-text-field>
                    <v-text-field label="Full Title"></v-text-field>
                    <v-card-text class="px-0"><h3>Units/Hours</h3></v-card-text>
                    <div class="d-flex">
                      <v-text-field label="Units" class="mx-3"></v-text-field>
                      <v-text-field label="In-Class Hours" class="mx-3"></v-text-field>
                      <v-text-field label="Out-of-Class Hours" class="mx-3"></v-text-field>
                    </div>
                  </div>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="green" class="white--text">
                      Add Class
                    </v-btn>
                  </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
export default {
    name: 'CustomClass',
    data: function() {
        return {
            viewDialog: false,
        }
    }
}
</script>