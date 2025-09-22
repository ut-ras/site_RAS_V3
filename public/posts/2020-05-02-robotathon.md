# Robotathon Steering Committee - Your Second Program Update
## 2020 - Robotathon Steering Committee
Hey y'all, this is Matthew, co-head of Robotathon, here again. This is the second update this semester from our Robotathon steering committee.

Recently, we've gone through our semesterly meeting of hell and have secured funding for next semester's Robotathon.

I thought it would be interesting to describe how RAS will organize the competition (and to document it somewhere, for personal reference), so I'll have a second and third post, labeled *Robotathon Steering Committee - How It's Made*, posted today or tomorrow detailing how we decided to allocate the money, what needs to be done to host a competition, and logistic challenges that past competitions have faced.


## Documentation

So, our Robotathon Guide is in the works! Spoiler image below (I've whited out competition specific pages). About one third to a half of the pages are completed, with a lot of them needing codebase development and testing to validate that they work. Again, we hope that this guide will be mostly reusable year over year, and that it'll be useful outside of Robotathon for anyone interested in embedded development with the TM4C or robots in general.

I don't anticipate releasing the entire guide onto the site until Kickoff, but you may see a couple of pages during update posts in the summer.

![Robotathon Guide Table of Contents](/images//blog/2020-05-02-robotathon/toc.png)


## Codebase

After a month of procrastinating (Spring Break) and a month of dying to Algorithm and Comp Arch labs, I've started looking at the source code for the current RASWare repository. I'm looking to start writing pull requests and changes to this within the next two weeks. This will be an ongoing project throughout the summer, so progress will be incremental.

Some of the things I'll be looking at:

* Designing a top down hierarchy view of the various files to promote functional understanding. I'll be organizing it by sensors and actuators, delineating any relationship between files.

* Improving comments and code signatures (like javadocs). I want to make it explicit what are the interfaces for the various functions and components, easily readable by beginners.

* Adding support for new sensors and motors. Also, updating the I2C interface and making sure it's up to snuff (hint hint).

* Updating the documentation and demos. I want to be able to have fully compilable, flashable code that users can plug and play and use as a base for their robot software. There is a RASDemo folder in the RASWare repo, but I somewhat remember some of the demos, like linesensor.c being only semi functional.


Finally, if you're attending UT next fall (we can only hope the pandemic subsides and the university reopens by then), and this competition sounds interesting, please feel free to contact us! We're also open for any contributors who might want to help with design and software development over the summer.

You can join our slack at utras.slack.com and message me (@RoboticFish) or the other co-lead (@Burak Biyikli) or email me at matthewjkyu@gmail.com.

Author: Matthew Yu
