
# RAS

To start ```cd``` into the *site_RAS_V3* directory and then
run ```npm run dev``` from the terminal


# New webmaster
for setting up actions

generate an ssh key, copy it to linux.cs.utexas.edu (or the ece server) and panel.utweb.utexas.edu. Set up deploy.sh. Now it should autobuild on server using github actions.

put the key in SSH_PRIVATE_KEY gh secret
ssh-copy-id karma@linux.cs.utexas.edu

