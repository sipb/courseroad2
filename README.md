# CourseRoad 2.0
CourseRoad is a tool for planning out your classes over your entire time at MIT.
It makes it easy to explore different majors and minors,
view your progress towards their requirements,
and choose which classes to take when in order to maximize your time at MIT.
CourseRoad allows you to look more than one semester ahead make fully informed choices about the big picture.

# Installation
TODO: do a practice install from scratch and make this section better.

`npm install` in the base directory should 'just work' (might need to prepend `sudo ` if your npm environment is messy like mine).

If that doesn't work... just do `npm install <package> --save-dev` for every package mentioned in error messages until it works (have to run command below).

# Running
`npm run dev` then go to <http://localhost:8080/>.

# Publishing

How to push changes to the live site:
1. `npm run build`
2. `scp -r dist YOUR_KERB@athena.dialup.mit.edu:` (puts a copy of the dist folder in your home directory in athena)
3. ssh into an athena machine with `ssh npfoss@athena.dialup.mit.edu`
4. `aklog athena sipb` (to get the permissions right so you can edit the courseroad folder)
5. `mv dist/* /mit/courseroad/web_scripts/courseroad/dev/`
6. go to [courseroad.mit.edu/dev/](https://courseroad.mit.edu/dev/) and make sure it works
7. `cd /mit/courseroad/web_scripts/courseroad/`
8. `mv dev/* .`