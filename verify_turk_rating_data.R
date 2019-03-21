library(ggplot2)
library(plyr)

s <- read.csv("http://linguistics.berkeley.edu/~kjohnson/subjects.csv",header=TRUE)
d <- read.csv("http://linguistics.berkeley.edu/~kjohnson//unique_data.csv",header=TRUE);
df <- NULL;

for (sbj in levels(s$subj)) {
  L1 <- s$L1[s$subj==sbj];
  if (!(L1 %in% c("English", "english", "ENGLISH", "eng"))) {
    print(paste(sbj,"not native English"));
    next;
  } 

  subd <- subset(d,d$subj==sbj); # subset of this subject's data
  
  if (length(subd)<1) {
    print(paste(sbj,'no data'));
    next;
  }

  if (length(subd$resp)<50) {
    print(paste(sbj,'not enough tokens'));
    next;
  }
  
  t<-table(subd$status);
  propOK =  t[4]/sum(t);
  if (propOK < 0.8) {
    print(paste(sbj,"fewer than 90% status OK"));
    next;
  }
   
  t <- table(subd$resp); 
  mp <- max(prop.table(t));
  if (mp>0.5) {
    print(paste(sbj,"used one response over 50% of the time"));
    next;
  }
  
  print(paste(sbj,"looks OK"));
  
  df <- rbind(df,subd);  
}

levels(df$subj)


# plot RT distribution
rt_from_offset = df$rt- df$filedur
plot(density(rt_from_offset,na.rm=T),main="Pooled subjects",
       xlab="Reaction time (ms) from stimulus offset",xlim=c(-2000,10000))
abline(v=0)
rug(rt_from_offset)




