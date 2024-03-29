Type Inference And Data Cleaning
-----------------------------
This repository provides an automated dynamic custom rule base type inference and data cleansing functionalities.

Supported Data-Type Mapping Flow
---------------------------------
The data-types can be [found here](https://pandas.pydata.org/docs/reference/arrays.html).

Frontend:
-----------
- Uploads the csv file
- Uploads the type mapping and alias rule file
    - uses user-defined regex for identifying the type of a column
    - uses user-defined regex for extracting the value and presentation format
    - user defines fallback or custom alias for no-match type for INFO
- Display the output

Backend:
---------
- Performs auto type inference
- Executed the mapping rule file and the alias name map.
- Return the result  

Pros:
--------
   - can add custom types that pandas doesn't support and
     classify them based on the regex pattern and alias name
   - it is re-usable
   - it is dynamic via configurability
   - it is error prone. Only practical error is from the user (data, regex).
   - it is computationally efficient as it doesn't update the data i.e. only batched parrallel reads

Optimizations/Future Work Maybe:
------------------------------------
- Caching the rule-file and the data-set. Maybe not worth it if it is not frequently
  accessible and if the data size is really large. It might be less performant because
  of complexity increases.
- Taking the full advantages of PySpark over Pandas. Since PySpark is an extension of
  Pandas this within the requirement constraints.
- Modifying Pandas TextFileReader to read asynchronously with optimizations like
  Java's RandomAccessFile seek operations (Maybe this other bit is covered?). 
  For more scalable and effective batching (IO).                     
- Identifying which cell by coloring broke the regex rule or violated the regex rule
- A way for the UI to transfer pre-registered rules to other columns for better user experience
- A way match column names (via regex) to a particular rule
- UI enforces blocking of regex look-behind and look-ahead operations similar unstable (error), performance intensive, 
  and security prone functionalities.
- Backend adding information (meta-data) on which cells (column/row) broke the matching rules. And how the users can jump
  to the errors.
  
Installation And Running:
------------------------
- git clone the repository or download its files.
- Install the latest python [version](https://www.python.org/downloads/)
- Get a terminal an execute the below;
  ```
     cd solution/backend/
	 pip install -r requirements. txt
     python manage.py migrate
     python manage.py runserver
  ```
- On a separate terminal. Execute the below;
  ```
     cd solution/frontend/app
     npm install
     npm run dev	 
  ```
- Click this [link](http://localhost:5173/) to launch the UI.


Demo Video
--------------
Here is the [demo video link](https://1drv.ms/v/s!AhUZZDWWJbplhJ0TRHkclejdrcvDYw)
