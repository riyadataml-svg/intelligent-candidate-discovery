TalentIQ AI tries to fix some of the usual problems recruiters run into with regular tracking systems. Those systems mostly just match keywords so good candidates get missed pretty often. This one uses meaning based matching along with skill checks and a few other signals to rank people instead. It also gives reasons for the scores which helps when you need to explain why someone made it to the shortlist or not.

Resume screening takes forever when you do it by hand and the results can feel inconsistent from one reviewer to the next. The tool pulls text out of pdf files, pulls out skills and background details then compares them to what the job actually needs. There is a mode that hides names and stuff to cut down on bias during the first look. You can also line up a couple candidates next to each other to see differences more clearly.

The ranking part mixes semantic scores with skill overlap and some behavioral notes, weighting them so semantic match counts for half. Scores above ninety get labeled strong hire while anything under sixty tends to get rejected. It is not perfect though because real hiring still needs human judgment on culture fit and other things that numbers miss.

They built it with streamlit for the interface and sentence transformers plus spacy for the language parts. Data handling uses pandas and numpy while resumes get read with pymupdf. Visuals come from plotly and they store stuff in sqlite for now. The flow goes from uploading the job description then resumes then running the match and ending up at a dashboard with charts.

Project files are pretty simple with the main app script and separate files for parsing matching and ranking. Setup is the usual clone and install steps which worked fine on my machine after creating the environment. Future ideas mentioned include pulling from linkedin or adding a chat helper but those are not done yet.

Some parts of the skill gap view feel a bit basic still and the interview questions it suggests are only as good as the data fed in. Overall it shows a decent attempt at making the process less manual though.
