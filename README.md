# CourseRoad 2.0

CourseRoad is a tool for planning out your classes over your entire time at MIT.
It makes it easy to explore different majors and minors,
view your progress towards their requirements,
and choose which classes to take when in order to maximize your time at MIT.
CourseRoad allows you to look more than one semester ahead make fully informed choices about the big picture.

## Installation

`npm install`

## Running

`npm run dev` then go to <http://localhost:8080/>.

## Publishing

How to push changes to the live site:

```bash
./deploy.sh [dev|prod] [kerberos]
```

which will deploy the code to the [dev](https://courseroad.mit.edu/dev/) and [main](https://courseroad.mit.edu/) sites respectively.

**Very important:** Always deploy to `dev` and test it before deploying to `prod`!
